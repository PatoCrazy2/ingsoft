"""
Serializers for RehabWeb_API.

Define your serializers here.
"""

from rest_framework import serializers
from .models import (
    Ejercicio,
    ValidacionEjercicio,
    RolUsuario,
    PerfilClinico,
    EvaluacionClinica,
    Paciente,
)


def _nivel_entero(valor) -> int | None:
    if valor is None:
        return None
    try:
        return int(str(valor))
    except (TypeError, ValueError):
        return None

class ValidacionEjercicioSerializer(serializers.ModelSerializer):
    """
    Serializer para crear validaciones de ejercicios.
    """
    class Meta:
        model = ValidacionEjercicio
        fields = ['es_valido', 'comentario']

    def validate(self, data):
        ejercicio = self.context.get('ejercicio')
        user = self.context.get('request').user
        
        # Validar que el validador no sea el mismo creador
        if ejercicio and ejercicio.creador == user:
            raise serializers.ValidationError(
                {"validador": "Un creador no puede validar su propio ejercicio."}
            )
        return data

class EjercicioSerializer(serializers.ModelSerializer):
    """
    Serializer de solo lectura para Ejercicio con campos calculados.
    """
    total_validaciones = serializers.SerializerMethodField()
    puede_validar = serializers.SerializerMethodField()
    creador_nombre = serializers.ReadOnlyField(source='creador.nombre_completo')

    class Meta:
        model = Ejercicio
        fields = '__all__'

    def get_total_validaciones(self, obj):
        return obj.validaciones.filter(es_valido=True).count()

    def get_puede_validar(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
            
        # El usuario puede validar si no es el creador y tiene rol apto (Terapeuta/Admin)
        es_creador = obj.creador == request.user
        es_apto = request.user.rol in [RolUsuario.TERAPEUTA, RolUsuario.ADMIN]
        return es_apto and not es_creador

class EjercicioCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para creación y actualización de Ejercicios con validación de medios.
    """
    class Meta:
        model = Ejercicio
        fields = [
            'id', 'nombre', 'descripcion', 'series', 'repeticiones',
            'tiempo_segundos', 'url_video', 'video_archivo',
            'evidencia_cientifica', 'referencias_bibliograficas',
            'thumbnail_url',
            'movilidad_paciente_min', 'movilidad_paciente_max',
            'territorios_acv_compatibles',
            'categoria', 'etiquetas_clinicas',
        ]
        read_only_fields = ['id']

    def validate(self, data):
        url_video = data.get('url_video')
        video_archivo = data.get('video_archivo')

        # En creación o actualización, al menos uno de los dos debe existir
        # Evaluamos combinando lo que viene en el input con lo que ya tiene la instancia
        instance = self.instance

        current_url = url_video if 'url_video' in data else (instance.url_video if instance else None)
        current_file = video_archivo if 'video_archivo' in data else (instance.video_archivo if instance else None)

        ev_raw = data.get('evidencia_cientifica', serializers.empty)
        if ev_raw is serializers.empty and instance:
            ev_raw = instance.evidencia_cientifica
        ev_text = (ev_raw or '').strip() if ev_raw is not None else ''
        if len(ev_text) < 20:
            raise serializers.ValidationError(
                {
                    'evidencia_cientifica': (
                        'La evidencia científica es obligatoria (mín. 20 caracteres; Markdown/HTML).'
                    )
                }
            )
        if not current_url and not current_file and len(ev_text) < 40:
            raise serializers.ValidationError(
                'Sin URL ni archivo de vídeo, amplíe la evidencia científica (mín. 40 caracteres).'
            )

        mn = data.get('movilidad_paciente_min')
        mx = data.get('movilidad_paciente_max')
        if instance:
            if mn is None:
                mn = instance.movilidad_paciente_min
            if mx is None:
                mx = instance.movilidad_paciente_max
        imn = _nivel_entero(mn)
        imx = _nivel_entero(mx)
        if imn is not None and imx is not None and imn > imx:
            raise serializers.ValidationError(
                {'movilidad_paciente_min': 'El nivel mínimo no puede ser mayor que el máximo.'}
            )

        terrs = data.get('territorios_acv_compatibles')
        if terrs is not None and not isinstance(terrs, list):
            raise serializers.ValidationError(
                {'territorios_acv_compatibles': 'Debe ser una lista de códigos de territorio.'}
            )

        etiq = data.get('etiquetas_clinicas')
        if etiq is not None:
            if not isinstance(etiq, list):
                raise serializers.ValidationError(
                    {'etiquetas_clinicas': 'Debe ser una lista de etiquetas (texto).'}
                )
            for item in etiq:
                if not isinstance(item, str):
                    raise serializers.ValidationError(
                        {'etiquetas_clinicas': 'Cada etiqueta debe ser una cadena de texto.'}
                    )

        return data


class PerfilClinicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilClinico
        fields = [
            'id', 'diagnostico_principal', 'historial_medico', 'nivel_movilidad',
            'restricciones', 'territorio_acv',
        ]


class EvaluacionClinicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluacionClinica
        fields = [
            'id', 'fecha_evaluacion', 'notas_evaluacion', 'metricas_objetivas',
            'es_evaluacion_inicial', 'terapeuta_evaluador',
        ]
        read_only_fields = [
            'id', 'fecha_evaluacion', 'notas_evaluacion', 'metricas_objetivas',
            'es_evaluacion_inicial', 'terapeuta_evaluador',
        ]


class PacienteListSerializer(serializers.ModelSerializer):
    paciente_id = serializers.UUIDField(source='usuario_id', read_only=True)
    nombre_completo = serializers.CharField(source='usuario.nombre_completo', read_only=True)
    email = serializers.EmailField(source='usuario.email', read_only=True)

    class Meta:
        model = Paciente
        fields = ['paciente_id', 'nombre_completo', 'email', 'estado']


class PacienteDetalleSerializer(serializers.ModelSerializer):
    paciente_id = serializers.UUIDField(source='usuario_id', read_only=True)
    nombre_completo = serializers.CharField(source='usuario.nombre_completo', read_only=True)
    email = serializers.EmailField(source='usuario.email', read_only=True)
    perfil_clinico = PerfilClinicoSerializer(read_only=True)
    evaluacion_prioritaria = serializers.SerializerMethodField()

    class Meta:
        model = Paciente
        fields = [
            'paciente_id', 'nombre_completo', 'email', 'estado', 'fecha_nacimiento',
            'perfil_clinico', 'evaluacion_prioritaria',
        ]

    def get_evaluacion_prioritaria(self, obj):
        ev = obj.evaluaciones.filter(es_evaluacion_inicial=True).order_by('-fecha_evaluacion').first()
        if not ev:
            ev = obj.evaluaciones.order_by('fecha_evaluacion').first()
        if not ev:
            return None
        return EvaluacionClinicaSerializer(ev).data
