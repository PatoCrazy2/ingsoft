import uuid

from django.db.models import IntegerField, Q
from django.db.models.functions import Cast
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.response import Response

from ..clinical_prefilter import ejercicio_compatible_territorio, movilidad_efectiva_paciente
from ..models import (
    Ejercicio,
    EstadoPublicacion,
    Paciente,
    RolUsuario,
    Terapeuta,
    ValidacionEjercicio,
)
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

    def _resolve_paciente_prefiltro(self, user, paciente_id):
        try:
            uid = uuid.UUID(str(paciente_id))
        except ValueError as exc:
            raise ValidationError({'paciente': 'Debe ser un UUID válido.'}) from exc
        paciente = (
            Paciente.objects.filter(usuario_id=uid)
            .select_related('perfil_clinico')
            .prefetch_related('evaluaciones')
            .first()
        )
        if not paciente:
            raise NotFound('Paciente no encontrado.')
        if user.rol == RolUsuario.ADMIN:
            pass
        elif user.rol == RolUsuario.TERAPEUTA:
            t = Terapeuta.objects.filter(usuario=user).first()
            if not t or paciente.terapeuta_id != t.pk:
                raise PermissionDenied('No puede acceder a este paciente.')
        else:
            raise PermissionDenied(
                'Solo terapeutas o administradores pueden usar el pre-filtrado por paciente.'
            )
        if not paciente.perfil_clinico:
            raise ValidationError(
                {
                    'paciente': (
                        'El paciente no tiene perfil clínico (RF-CLIN-001); no se puede pre-filtrar.'
                    )
                }
            )
        return paciente

    def _filtros_catalogo(self, queryset):
        if self.action != 'list':
            return queryset
        cat = self.request.query_params.get('categoria')
        est = self.request.query_params.get('estado_publicacion')
        if cat:
            queryset = queryset.filter(categoria=cat)
        if est:
            queryset = queryset.filter(estado_publicacion=est)
        return queryset

    def get_queryset(self):
        user = self.request.user
        qs = Ejercicio.objects.select_related('creador').prefetch_related('validaciones')

        if not user.is_authenticated:
            return qs.none()

        paciente_id = self.request.query_params.get('paciente')
        if self.action == 'list' and paciente_id:
            paciente = self._resolve_paciente_prefiltro(user, paciente_id)
            nivel = movilidad_efectiva_paciente(paciente)
            if nivel is None:
                return Ejercicio.objects.none()
            base = qs.filter(estado_publicacion=EstadoPublicacion.PUBLICADO)
            base = base.annotate(
                _mn=Cast('movilidad_paciente_min', IntegerField()),
                _mx=Cast('movilidad_paciente_max', IntegerField()),
            ).filter(_mn__lte=nivel, _mx__gte=nivel)
            territorio = paciente.perfil_clinico.territorio_acv
            ids = [
                e.pk
                for e in base
                if ejercicio_compatible_territorio(e.territorios_acv_compatibles, territorio)
            ]
            return (
                Ejercicio.objects.filter(pk__in=ids)
                .select_related('creador')
                .prefetch_related('validaciones')
            )

        if user.rol == RolUsuario.ADMIN:
            return self._filtros_catalogo(qs)

        if self.action == 'validar':
            return qs.filter(
                Q(estado_publicacion=EstadoPublicacion.PUBLICADO)
                | Q(estado_publicacion=EstadoPublicacion.PENDIENTE_VALIDACION)
            )

        return self._filtros_catalogo(
            qs.filter(estado_publicacion=EstadoPublicacion.PUBLICADO)
        )

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

    @action(
        detail=False,
        methods=['get'],
        url_path='categorias',
        permission_classes=[permissions.AllowAny],
    )
    def categorias(self, request):
        """Listado de categorías clínicas (tesauro de categoría principal)."""
        from ..models import CategoriaEjercicio

        return Response(
            [{'codigo': c[0], 'nombre': c[1]} for c in CategoriaEjercicio.choices]
        )

    @action(detail=True, methods=['get'], permission_classes=[IsAdminRol])
    def preview(self, request, pk=None):
        """
        GET /ejercicios/{id}/preview/
        Permite previsualizar un ejercicio ignorando el filtro de estado PUBLICADO.
        """
        ejercicio = self.get_object()
        serializer = EjercicioSerializer(ejercicio, context={'request': request})
        return Response(serializer.data)
