"""
Serializers for RehabWeb_API.

Define your serializers here.
"""

from rest_framework import serializers
from .models import Ejercicio, ValidacionEjercicio, RolUsuario

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
            'thumbnail_url'
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

        if not current_url and not current_file:
            raise serializers.ValidationError(
                "Debe proporcionar al menos un medio de video (URL o Archivo)."
            )
            
        return data
