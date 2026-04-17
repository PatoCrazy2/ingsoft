from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q
from ..models import Ejercicio, ValidacionEjercicio, RolUsuario, EstadoPublicacion
from ..serializers import (
    EjercicioSerializer, 
    EjercicioCreateUpdateSerializer, 
    ValidacionEjercicioSerializer
)
from ..permissions import IsAdminRol

class EjercicioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para la gestión de Ejercicios.
    Incluye lógica de publicación automática y validación por pares.
    """
    queryset = Ejercicio.objects.all()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return EjercicioCreateUpdateSerializer
        return EjercicioSerializer

    def get_permissions(self):
        # Permisos granulares por acción
        if self.action == 'create':
            return [IsAdminRol()]
        if self.action in ['update', 'partial_update']:
            return [IsAdminRol()]
        if self.action == 'destroy':
            return [IsAdminRol()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        # Optimizamos con select_related y prefetch_related
        qs = Ejercicio.objects.select_related('creador').prefetch_related('validaciones')
        
        if not user.is_authenticated:
            return qs.none()

        # El Admin ve todo.
        if user.rol == RolUsuario.ADMIN:
            return qs
        
        # Durante la validación, los Terapeutas deben poder ver los ejercicios PENDIENTES
        if self.action == 'validar':
            return qs.filter(
                Q(estado_publicacion=EstadoPublicacion.PUBLICADO) | 
                Q(estado_publicacion=EstadoPublicacion.PENDIENTE_VALIDACION)
            )
        
        # Otros roles (Pacientes) o Terapeutas en listado general solo ven PUBLICADOS
        return qs.filter(estado_publicacion=EstadoPublicacion.PUBLICADO)

    def perform_create(self, serializer):
        """
        Al crear un ejercicio, se establece automáticamente como PENDIENTE_VALIDACION
        y se asigna al usuario actual como creador.
        """
        serializer.save(
            creador=self.request.user,
            estado_publicacion=EstadoPublicacion.PENDIENTE_VALIDACION
        )

    def perform_update(self, serializer):
        """
        Si un ejercicio ya estaba PUBLICADO y un Admin lo edita, 
        su estado vuelve a PENDIENTE_VALIDACION automáticamente.
        """
        instance = self.get_object()
        if instance.estado_publicacion == EstadoPublicacion.PUBLICADO:
            serializer.save(estado_publicacion=EstadoPublicacion.PENDIENTE_VALIDACION)
        else:
            serializer.save()

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def validar(self, request, pk=None):
        """
        POST /ejercicios/{id}/validar/
        Permite a un Terapeuta o Admin validar un ejercicio.
        Si alcanza 2 validaciones positivas, se publica.
        Si la validación es negativa, vuelve a BORRADOR.
        """
        ejercicio = self.get_object()
        serializer = ValidacionEjercicioSerializer(
            data=request.data, 
            context={'request': request, 'ejercicio': ejercicio}
        )
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Crear la validación
        ValidacionEjercicio.objects.create(
            ejercicio=ejercicio,
            validador=request.user,
            es_valido=serializer.validated_data['es_valido'],
            comentario=serializer.validated_data['comentario']
        )
        
        # Lógica de transición de estados
        if not serializer.validated_data['es_valido']:
            # Si una validación es negativa, el ejercicio vuelve a borrador para ajustes
            ejercicio.estado_publicacion = EstadoPublicacion.BORRADOR
        else:
            # Si es positiva, verificamos cuántas lleva
            conteo_positivas = ejercicio.validaciones.filter(es_valido=True).count()
            if conteo_positivas >= 2:
                ejercicio.estado_publicacion = EstadoPublicacion.PUBLICADO
        
        ejercicio.save()
        
        return Response({
            "detail": "Validación registrada exitosamente.",
            "nuevo_estado": ejercicio.estado_publicacion,
            "validaciones_positivas": ejercicio.validaciones.filter(es_valido=True).count()
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], permission_classes=[IsAdminRol])
    def preview(self, request, pk=None):
        """
        GET /ejercicios/{id}/preview/
        Permite previsualizar un ejercicio ignorando el filtro de estado PUBLICADO.
        """
        ejercicio = self.get_object()
        serializer = EjercicioSerializer(ejercicio, context={'request': request})
        return Response(serializer.data)
