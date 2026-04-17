import uuid
import logging
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.forms.models import model_to_dict
from .models import Ejercicio, ValidacionEjercicio, Auditoria
from .audit_context import get_current_user

logger = logging.getLogger(__name__)

def clean_data(data):
    """
    Convierte UUIDs y otros tipos no serializables en strings 
    para su almacenamiento en JSONField.
    """
    if not data:
        return None
    
    if isinstance(data, dict):
        cleaned = {}
        for k, v in data.items():
            if isinstance(v, uuid.UUID):
                cleaned[k] = str(v)
            elif isinstance(v, (dict, list)):
                cleaned[k] = clean_data(v)
            else:
                cleaned[k] = v
        return cleaned
    
    if isinstance(data, list):
        return [clean_data(item) for item in data]
        
    return str(data) if isinstance(data, uuid.UUID) else data

@receiver(pre_save, sender=Ejercicio)
def capture_previous_ejercicio_state(sender, instance, **kwargs):
    """
    Captura el estado anterior del Ejercicio antes de que se guarde en la DB.
    Permite comparar cambios en el post_save.
    """
    try:
        if instance.pk:
            # Recuperamos la versión actual de la DB antes del cambio
            previous = Ejercicio.objects.filter(pk=instance.pk).first()
            if previous:
                # Guardamos snapshot en un atributo temporal de la instancia
                instance._previous_state = model_to_dict(previous)
        else:
            instance._previous_state = None
    except Exception as e:
        logger.error(f"Error capturando estado previo de Ejercicio: {e}")

@receiver(post_save, sender=Ejercicio)
def audit_ejercicio_save(sender, instance, created, **kwargs):
    """
    Genera un registro de Auditoria tras crear o actualizar un Ejercicio.
    """
    try:
        user = get_current_user()
        
        # Si no hay usuario en el hilo (ej. comandos management), 
        # fallará el guardado si Auditoria.usuario no admite null.
        if not user:
            logger.warning("Auditoria abortada: No se detectó usuario en el contexto actual.")
            return

        accion = 'EJERCICIO_CREADO' if created else 'EJERCICIO_ACTUALIZADO'
        
        datos_previos = getattr(instance, '_previous_state', None)
        datos_nuevos = model_to_dict(instance)
        
        Auditoria.objects.create(
            usuario=user,
            accion=accion,
            entidad_afectada='Ejercicio',
            entidad_id=instance.pk,
            datos_previos=clean_data(datos_previos),
            datos_nuevos=clean_data(datos_nuevos)
        )
    except Exception as e:
        # Importante: No interrumpir la operación principal si falla la auditoría
        logger.error(f"FALLO CRITICO EN SEÑAL DE AUDITORIA (Ejercicio): {e}")

@receiver(post_save, sender=ValidacionEjercicio)
def audit_validacion_save(sender, instance, created, **kwargs):
    """
    Registra auditoría tras la creación de una validación.
    """
    if not created:
        return

    try:
        user = get_current_user()
        if not user:
            return

        accion = 'EJERCICIO_VALIDADO' if instance.es_valido else 'EJERCICIO_RECHAZADO'
        
        datos_nuevos = {
            'ejercicio_id': str(instance.ejercicio.id),
            'validador_id': str(instance.validador.id),
            'es_valido': instance.es_valido,
            'comentario': instance.comentario
        }
        
        Auditoria.objects.create(
            usuario=user,
            accion=accion,
            entidad_afectada='ValidacionEjercicio',
            entidad_id=instance.pk,
            datos_previos=None,
            datos_nuevos=datos_nuevos
        )
    except Exception as e:
        logger.error(f"FALLO CRITICO EN SEÑAL DE AUDITORIA (Validacion): {e}")
