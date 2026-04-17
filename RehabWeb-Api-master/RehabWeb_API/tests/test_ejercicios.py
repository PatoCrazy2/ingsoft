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

    def test_creacion_solo_admin_y_estado_automatico(self):
        """
        Garantiza que solo el Admin crea y que el estado inicial sea PENDIENTE_VALIDACION.
        """
        self.client.force_authenticate(user=self.admin)
        data = {
            "nombre": "Estiramiento Isquio",
            "descripcion": "Estirar con banda elástica",
            "series": 3,
            "repeticiones": 1,
            "tiempo_segundos": 30,
            "url_video": "https://video-example.com/stretch"
        }
        response = self.client.post(self.ejercicios_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        ejercicio = Ejercicio.objects.get(id=response.data['id'])
        self.assertEqual(ejercicio.estado_publicacion, EstadoPublicacion.PENDIENTE_VALIDACION)
        self.assertEqual(ejercicio.creador, self.admin)

    def test_terapeuta_no_tiene_permiso_de_creacion(self):
        """
        Verifica que el rol Terapeuta no puede crear ejercicios directamente.
        """
        self.client.force_authenticate(user=self.terapeuta)
        response = self.client.post(self.ejercicios_list_url, {"nombre": "Intento"})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_requiere_video_o_archivo(self):
        """
        Verifica la validación personalizada del serializer: debe haber URL o Archivo.
        """
        self.client.force_authenticate(user=self.admin)
        data = {
            "nombre": "Sin Video",
            "descripcion": "Error esperado",
            "series": 3, "repeticiones": 10
        }
        response = self.client.post(self.ejercicios_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Debe proporcionar al menos un medio de video", str(response.data))

    def test_visibilidad_segun_rol(self):
        """
        Los pacientes/terapeutas solo ven ejercicios PUBLICADOS. El admin ve todos.
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

        # Prueba con Paciente
        self.client.force_authenticate(user=self.paciente)
        response = self.client.get(self.ejercicios_list_url)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['nombre'], "Visible")

        # Prueba con Admin
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.ejercicios_list_url)
        self.assertEqual(len(response.data), 2)

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
