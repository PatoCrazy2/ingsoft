from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from ..models import Paciente, RolUsuario, Terapeuta, PerfilClinico, TerritorioACV, NivelMovilidad
from ..permissions import IsTerapeutaOrAdmin
from ..serializers import PacienteListSerializer, PacienteDetalleSerializer, PerfilClinicoSerializer


class PacienteViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Listado y detalle de pacientes para el terapeuta (o admin).
    Incluye perfil clínico y evaluación prioritaria en detalle.
    """
    permission_classes = [permissions.IsAuthenticated, IsTerapeutaOrAdmin]
    lookup_field = 'usuario_id'

    def get_queryset(self):
        user = self.request.user
        base = Paciente.objects.select_related(
            'usuario', 'perfil_clinico', 'terapeuta__usuario',
        ).prefetch_related('evaluaciones')
        if user.rol == RolUsuario.ADMIN:
            return base
        t = Terapeuta.objects.filter(usuario=user).first()
        if not t:
            return Paciente.objects.none()
        return base.filter(terapeuta=t)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PacienteDetalleSerializer
        return PacienteListSerializer

    @action(detail=True, methods=['patch'], url_path='perfil-clinico')
    def perfil_clinico(self, request, usuario_id=None):
        """
        PATCH /pacientes/{usuario_id}/perfil-clinico/
        Crea o actualiza el perfil clínico (RF-CLIN-001) para pruebas y demos.
        """
        paciente = self.get_object()
        if request.user.rol == RolUsuario.TERAPEUTA:
            t = Terapeuta.objects.filter(usuario=request.user).first()
            if not t or paciente.terapeuta_id != t.pk:
                return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)

        perfil = paciente.perfil_clinico
        if perfil is None:
            valid_ter = {c[0] for c in TerritorioACV.choices}
            tv = request.data.get('territorio_acv')
            if tv is not None and tv not in valid_ter:
                return Response(
                    {'territorio_acv': f'Valores permitidos: {sorted(valid_ter)}'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            perfil = PerfilClinico.objects.create(
                diagnostico_principal=request.data.get('diagnostico_principal', 'Sin diagnóstico'),
                historial_medico=request.data.get('historial_medico', ''),
                nivel_movilidad=request.data.get('nivel_movilidad', NivelMovilidad.NIVEL_3),
                restricciones=request.data.get('restricciones', ''),
                territorio_acv=tv,
            )
            paciente.perfil_clinico = perfil
            paciente.save(update_fields=['perfil_clinico'])
            return Response(PerfilClinicoSerializer(perfil).data, status=status.HTTP_201_CREATED)

        allowed = {
            'diagnostico_principal', 'historial_medico', 'nivel_movilidad',
            'restricciones', 'territorio_acv',
        }
        payload = {k: v for k, v in request.data.items() if k in allowed}
        valid_ter = {c[0] for c in TerritorioACV.choices}
        if 'territorio_acv' in payload:
            tv = payload['territorio_acv']
            if tv is not None and tv not in valid_ter:
                return Response(
                    {'territorio_acv': f'Valores permitidos: {sorted(valid_ter)}'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        for k, v in payload.items():
            setattr(perfil, k, v)
        perfil.save()
        return Response(PerfilClinicoSerializer(perfil).data)
