from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from ..models import Usuario, Ejercicio, ValidacionEjercicio, RolUsuario, EstadoPublicacion

class EjercicioTests(APITestCase):
    """
    Suite de pruebas para validar la lógica de negocio de Ejercicios,
    incluyendo permisos, transiciones de estado y validaciones por pares.
    """

    def setUp(self):
        # Escenario Base: Crear usuarios con diferentes roles
        self.admin = Usuario.objects.create_user(
            email='admin@rehab.com',
            nombre_completo='Administrador Sistema',
            rol=RolUsuario.ADMIN,
            password='password123'
        )
        self.terapeuta = Usuario.objects.create_user(
            email='terapeuta@rehab.com',
            nombre_completo='Terapeuta Senior',
            rol=RolUsuario.TERAPEUTA,
            password='password123'
        )
        self.paciente = Usuario.objects.create_user(
            email='paciente@rehab.com',
            nombre_completo='Paciente en Rehabilitación',
            rol=RolUsuario.PACIENTE,
            password='password123'
        )
        
        # URL de la lista de ejercicios
        self.ejercicios_list_url = reverse('ejercicio-list')

    def test_creacion_admin_y_estado_automatico(self):
        """
        Admin crea ejercicios; estado inicial PENDIENTE_VALIDACION y creador asignado.
        """
        self.client.force_authenticate(user=self.admin)
        data = {
            "nombre": "Estiramiento Isquio",
            "descripcion": "Estirar con banda elástica",
            "series": 3,
            "repeticiones": 1,
            "tiempo_segundos": 30,
            "url_video": "https://video-example.com/stretch",
            "evidencia_cientifica": "Revisión sistemática 2020 sobre estiramientos isquiotibiales.",
        }
        response = self.client.post(self.ejercicios_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        ejercicio = Ejercicio.objects.get(id=response.data['id'])
        self.assertEqual(ejercicio.estado_publicacion, EstadoPublicacion.PENDIENTE_VALIDACION)
        self.assertEqual(ejercicio.creador, self.admin)

    def test_paciente_no_puede_crear(self):
        self.client.force_authenticate(user=self.paciente)
        response = self.client.post(
            self.ejercicios_list_url,
            {'nombre': 'X', 'descripcion': 'Y', 'series': 1, 'repeticiones': 1},
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_terapeuta_puede_crear_y_queda_pendiente(self):
        """Terapeuta puede proponer ejercicios; quedan en PENDIENTE_VALIDACION."""
        self.client.force_authenticate(user=self.terapeuta)
        data = {
            'nombre': 'Propuesta terapeuta',
            'descripcion': 'Descripción técnica del ejercicio propuesto.',
            'series': 3,
            'repeticiones': 10,
            'tiempo_segundos': 30,
            'url_video': 'https://video-example.com/t',
            'evidencia_cientifica': 'Revisión sistemática 2020 sobre el tema clínico asociado.',
            'categoria': 'MOVILIDAD',
        }
        response = self.client.post(self.ejercicios_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        ej = Ejercicio.objects.get(id=response.data['id'])
        self.assertEqual(ej.estado_publicacion, EstadoPublicacion.PENDIENTE_VALIDACION)
        self.assertEqual(ej.creador, self.terapeuta)

    def test_sin_video_exige_evidencia_extensa(self):
        """Sin vídeo: evidencia mínima 40 caracteres; siempre evidencia mín. 20."""
        self.client.force_authenticate(user=self.admin)
        data = {
            "nombre": "Solo texto",
            "descripcion": "Desc técnica",
            "series": 3,
            "repeticiones": 10,
            "evidencia_cientifica": "x" * 25,
        }
        response = self.client.post(self.ejercicios_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("40 caracteres", str(response.data))

    def test_sin_video_ok_con_evidencia_larga(self):
        self.client.force_authenticate(user=self.admin)
        largo = "Evidencia suficiente sin URL de vídeo. " * 2
        data = {
            "nombre": "Solo evidencia",
            "descripcion": "Desc",
            "series": 2,
            "repeticiones": 8,
            "evidencia_cientifica": largo,
            "categoria": "MOVILIDAD",
        }
        response = self.client.post(self.ejercicios_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_visibilidad_segun_rol(self):
        """
        Paciente: solo PUBLICADOS. Terapeuta: PUBLICADOS + sus borradores/pendientes.
        Admin: ve todo el catálogo.
        """
        Ejercicio.objects.create(
            nombre="Visible", descripcion="Ok", series=3, repeticiones=10,
            url_video="http://ok.com", estado_publicacion=EstadoPublicacion.PUBLICADO,
            creador=self.admin
        )
        Ejercicio.objects.create(
            nombre="Oculto", descripcion="Borrador", series=3, repeticiones=10,
            url_video="http://hidden.com", estado_publicacion=EstadoPublicacion.BORRADOR,
            creador=self.admin
        )
        Ejercicio.objects.create(
            nombre="Mi borrador terapeuta", descripcion="Propia", series=2, repeticiones=8,
            url_video="http://t.com", estado_publicacion=EstadoPublicacion.BORRADOR,
            creador=self.terapeuta
        )

        # Prueba con Paciente
        self.client.force_authenticate(user=self.paciente)
        response = self.client.get(self.ejercicios_list_url)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['nombre'], "Visible")

        # Terapeuta: público + su borrador (no el borrador del admin)
        self.client.force_authenticate(user=self.terapeuta)
        response = self.client.get(self.ejercicios_list_url)
        nombres = {row['nombre'] for row in response.data}
        self.assertEqual(nombres, {"Visible", "Mi borrador terapeuta"})

        # Prueba con Admin
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.ejercicios_list_url)
        self.assertEqual(len(response.data), 3)

    def test_flujo_validacion_por_pares_exitoso(self):
        """
        Simula 2 validaciones positivas para que un ejercicio pase a PUBLICADO.
        """
        ejercicio = Ejercicio.objects.create(
            nombre="Casi Publicado", descripcion="Validame", series=3, repeticiones=10,
            url_video="http://test.com", estado_publicacion=EstadoPublicacion.PENDIENTE_VALIDACION,
            creador=self.admin
        )
        validar_url = reverse('ejercicio-validar', kwargs={'pk': ejercicio.pk})

        # 1. Primera validación positiva (por Terapeuta)
        self.client.force_authenticate(user=self.terapeuta)
        self.client.post(validar_url, {"es_valido": True, "comentario": "Bien hecho"})
        ejercicio.refresh_from_db()
        self.assertEqual(ejercicio.estado_publicacion, EstadoPublicacion.PENDIENTE_VALIDACION)

        # 2. Segunda validación positiva (por otro Admin)
        admin2 = Usuario.objects.create_user(email='ad2@rehab.com', nombre_completo='A2', rol=RolUsuario.ADMIN, password='123')
        self.client.force_authenticate(user=admin2)
        self.client.post(validar_url, {"es_valido": True, "comentario": "Válido"})
        
        ejercicio.refresh_from_db()
        self.assertEqual(ejercicio.estado_publicacion, EstadoPublicacion.PUBLICADO)

    def test_rechazo_envia_a_borrador(self):
        """
        Si un revisor marca es_valido=False, el ejercicio vuelve a BORRADOR.
        """
        ejercicio = Ejercicio.objects.create(
            nombre="Para Rechazar", descripcion="Mal video", series=3, repeticiones=10,
            url_video="http://test.com", estado_publicacion=EstadoPublicacion.PENDIENTE_VALIDACION,
            creador=self.admin
        )
        validar_url = reverse('ejercicio-validar', kwargs={'pk': ejercicio.pk})

        self.client.force_authenticate(user=self.terapeuta)
        self.client.post(validar_url, {"es_valido": False, "comentario": "Mala calidad"})
        
        ejercicio.refresh_from_db()
        self.assertEqual(ejercicio.estado_publicacion, EstadoPublicacion.BORRADOR)

    def test_no_puedo_validar_mi_propio_ejercicio(self):
        """
        Regla de negocio: El creador no puede ser el validador.
        """
        ejercicio = Ejercicio.objects.create(
            nombre="Mi Ejercicio", descripcion="Desc", series=3, repeticiones=10,
            url_video="http://test.com", estado_publicacion=EstadoPublicacion.PENDIENTE_VALIDACION,
            creador=self.admin
        )
        validar_url = reverse('ejercicio-validar', kwargs={'pk': ejercicio.pk})

        self.client.force_authenticate(user=self.admin) # Autor del ejercicio
        response = self.client.post(validar_url, {"es_valido": True, "comentario": "Autovoto"})
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Un creador no puede validar su propio ejercicio", str(response.data))
