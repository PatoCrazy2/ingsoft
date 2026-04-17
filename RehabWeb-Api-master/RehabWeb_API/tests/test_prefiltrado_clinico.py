from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from RehabWeb_API.models import (
    Ejercicio,
    EstadoPublicacion,
    EvaluacionClinica,
    NivelMovilidad,
    Paciente,
    PerfilClinico,
    RolUsuario,
    Terapeuta,
    TerritorioACV,
    Usuario,
)


class PreFiltradoClinicoTests(APITestCase):
    """Pre-filtrado por perfil + evaluación (RF-CLIN-001 / RF-CLIN-002)."""

    def setUp(self):
        self.admin = Usuario.objects.create_user(
            email='admin@pf.com',
            nombre_completo='Admin',
            rol=RolUsuario.ADMIN,
            password='pass12345',
        )
        self.terapeuta = Usuario.objects.create_user(
            email='ter@pf.com',
            nombre_completo='Terapeuta',
            rol=RolUsuario.TERAPEUTA,
            password='pass12345',
        )
        self.ter = Terapeuta.objects.create(
            usuario=self.terapeuta,
            especialidad='Neuro',
            numero_licencia='LIC-PF-1',
        )
        self.paciente_user = Usuario.objects.create_user(
            email='pac@pf.com',
            nombre_completo='Paciente',
            rol=RolUsuario.PACIENTE,
            password='pass12345',
        )
        self.perfil = PerfilClinico.objects.create(
            diagnostico_principal='ACV isquémico',
            historial_medico='',
            nivel_movilidad=NivelMovilidad.NIVEL_3,
            restricciones='',
            territorio_acv=TerritorioACV.HEMISFERIO_DERECHO,
        )
        self.paciente = Paciente.objects.create(
            usuario=self.paciente_user,
            terapeuta=self.ter,
            perfil_clinico=self.perfil,
            estrategia_validacion='manual',
            estrategia_progreso='progresivo',
        )
        EvaluacionClinica.objects.create(
            paciente=self.paciente,
            terapeuta_evaluador=self.ter,
            fecha_evaluacion=timezone.now(),
            notas_evaluacion='Inicial',
            metricas_objetivas={'nivel_movilidad': '2'},
            es_evaluacion_inicial=True,
        )
        # Movilidad efectiva = min(3, 2) = 2
        Ejercicio.objects.create(
            nombre='Ej compatible',
            descripcion='d',
            series=2,
            repeticiones=8,
            url_video='https://example.com/a.mp4',
            estado_publicacion=EstadoPublicacion.PUBLICADO,
            creador=self.admin,
            movilidad_paciente_min='1',
            movilidad_paciente_max='3',
            territorios_acv_compatibles=['HEMISFERIO_DERECHO'],
        )
        Ejercicio.objects.create(
            nombre='Ej movilidad alta',
            descripcion='d',
            series=2,
            repeticiones=8,
            url_video='https://example.com/b.mp4',
            estado_publicacion=EstadoPublicacion.PUBLICADO,
            creador=self.admin,
            movilidad_paciente_min='4',
            movilidad_paciente_max='5',
            territorios_acv_compatibles=[],
        )
        Ejercicio.objects.create(
            nombre='Ej territorio otro',
            descripcion='d',
            series=2,
            repeticiones=8,
            url_video='https://example.com/c.mp4',
            estado_publicacion=EstadoPublicacion.PUBLICADO,
            creador=self.admin,
            movilidad_paciente_min='1',
            movilidad_paciente_max='5',
            territorios_acv_compatibles=['HEMISFERIO_IZQUIERDO'],
        )

    def test_prefiltrado_terapeuta_solo_compatibles(self):
        url = reverse('ejercicio-list')
        self.client.force_authenticate(user=self.terapeuta)
        r = self.client.get(url, {'paciente': str(self.paciente_user.pk)})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        nombres = {row['nombre'] for row in r.data}
        self.assertIn('Ej compatible', nombres)
        self.assertNotIn('Ej movilidad alta', nombres)
        self.assertNotIn('Ej territorio otro', nombres)

    def test_prefiltrado_sin_perfil_400(self):
        u = Usuario.objects.create_user(
            email='sinp@pf.com',
            nombre='Sin perfil',
            rol=RolUsuario.PACIENTE,
            password='pass12345',
        )
        Paciente.objects.create(
            usuario=u,
            terapeuta=self.ter,
            estrategia_validacion='m',
            estrategia_progreso='p',
        )
        self.client.force_authenticate(user=self.terapeuta)
        r = self.client.get(reverse('ejercicio-list'), {'paciente': str(u.pk)})
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_listado_pacientes_terapeuta(self):
        self.client.force_authenticate(user=self.terapeuta)
        r = self.client.get(reverse('paciente-list'))
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.data), 1)
        self.assertEqual(r.data[0]['email'], 'pac@pf.com')
