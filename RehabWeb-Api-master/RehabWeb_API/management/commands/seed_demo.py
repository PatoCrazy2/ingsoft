"""
Datos de demostración: administrador, terapeuta, pacientes con perfil clínico,
evaluaciones y ejercicios en distintos estados/categorías.
Idempotente (usuarios por email; ejercicios por nombre).
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from rest_framework.authtoken.models import Token

from RehabWeb_API.models import (
    CategoriaEjercicio,
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


class Command(BaseCommand):
    help = 'Inserta usuarios, pacientes y ejercicios de prueba para desarrollo / Docker.'

    def handle(self, *args, **options):
        pwd = 'demo12345'

        admin, _ = Usuario.objects.get_or_create(
            email='admin@demo.rehab',
            defaults={
                'nombre_completo': 'Admin Demo',
                'rol': RolUsuario.ADMIN,
                'is_staff': True,
                'is_superuser': True,
            },
        )
        admin.nombre_completo = 'Admin Demo'
        admin.rol = RolUsuario.ADMIN
        admin.is_staff = True
        admin.is_superuser = True
        admin.set_password(pwd)
        admin.save()

        ut, _ = Usuario.objects.get_or_create(
            email='terapeuta@demo.rehab',
            defaults={
                'nombre_completo': 'Terapeuta Demo',
                'rol': RolUsuario.TERAPEUTA,
            },
        )
        ut.nombre_completo = 'Terapeuta Demo'
        ut.rol = RolUsuario.TERAPEUTA
        ut.set_password(pwd)
        ut.save()

        ter, _ = Terapeuta.objects.get_or_create(
            usuario=ut,
            defaults={
                'especialidad': 'Fisioterapia neurológica',
                'numero_licencia': 'DEMO-T-001',
            },
        )
        ter.especialidad = 'Fisioterapia neurológica'
        ter.numero_licencia = 'DEMO-T-001'
        ter.save()

        for u in (admin, ut):
            Token.objects.get_or_create(user=u)

        def upsert_paciente(email: str, nombre: str, nivel: str, territorio: str | None):
            u, _ = Usuario.objects.get_or_create(
                email=email,
                defaults={'nombre_completo': nombre, 'rol': RolUsuario.PACIENTE},
            )
            u.nombre_completo = nombre
            u.rol = RolUsuario.PACIENTE
            u.set_password(pwd)
            u.save()

            pac, _ = Paciente.objects.get_or_create(
                usuario=u,
                defaults={
                    'terapeuta': ter,
                    'estrategia_validacion': 'demo',
                    'estrategia_progreso': 'demo',
                },
            )
            pac.terapeuta = ter
            pac.save()

            if pac.perfil_clinico_id:
                perfil = pac.perfil_clinico
                perfil.diagnostico_principal = f'ACV — {nombre}'
                perfil.historial_medico = 'Paciente de demostración.'
                perfil.nivel_movilidad = nivel
                perfil.restricciones = 'Según evolución clínica.'
                perfil.territorio_acv = territorio
                perfil.save()
            else:
                perfil = PerfilClinico.objects.create(
                    diagnostico_principal=f'ACV — {nombre}',
                    historial_medico='Paciente de demostración.',
                    nivel_movilidad=nivel,
                    restricciones='Según evolución clínica.',
                    territorio_acv=territorio,
                )
                pac.perfil_clinico = perfil
                pac.save()

            if not pac.evaluaciones.filter(es_evaluacion_inicial=True).exists():
                EvaluacionClinica.objects.create(
                    paciente=pac,
                    terapeuta_evaluador=ter,
                    fecha_evaluacion=timezone.now(),
                    notas_evaluacion='Evaluación inicial demo',
                    metricas_objetivas={'nivel_movilidad': nivel},
                    es_evaluacion_inicial=True,
                )

        upsert_paciente(
            'paciente1@demo.rehab',
            'Ana García',
            NivelMovilidad.NIVEL_3,
            TerritorioACV.HEMISFERIO_DERECHO,
        )
        upsert_paciente(
            'paciente2@demo.rehab',
            'Luis Martínez',
            NivelMovilidad.NIVEL_2,
            TerritorioACV.HEMISFERIO_IZQUIERDO,
        )

        ev_base = (
            'Revisión narrativa sobre ejercicios terapéuticos seguros en población con ACV. '
            'Referencias: **Smith et al. 2021**; ver también [guía clínica](https://example.org/guia).'
        )

        img_rodilla = (
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=720&q=80'
        )
        img_fuerza = (
            'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=720&q=80'
        )
        img_yoga = (
            'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=720&q=80'
        )
        img_caminar = (
            'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=720&q=80'
        )
        img_brazos = (
            'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=720&q=80'
        )

        ejemplos = [
            {
                'nombre': 'Flexión asistida de rodilla',
                'descripcion': 'Movilidad de rodilla en sedestación con apoyo; progresión suave post-ACV.',
                'categoria': CategoriaEjercicio.MOVILIDAD,
                'estado': EstadoPublicacion.PUBLICADO,
                'mov_min': '1',
                'mov_max': '4',
                'territorios': [TerritorioACV.HEMISFERIO_DERECHO, TerritorioACV.CUALQUIERA],
                'etiquetas': ['Tren inferior', 'Movilidad articular'],
                'thumbnail_url': img_rodilla,
                'series': 3,
                'repeticiones': 12,
            },
            {
                'nombre': 'Elevación frontal de hombro',
                'descripcion': 'Fortalecimiento del deltoides con carga ligera; control escapular.',
                'categoria': CategoriaEjercicio.FUERZA,
                'estado': EstadoPublicacion.PUBLICADO,
                'mov_min': '2',
                'mov_max': '5',
                'territorios': [],
                'etiquetas': ['Tren superior', 'Fortalecimiento'],
                'thumbnail_url': img_brazos,
                'series': 3,
                'repeticiones': 10,
            },
            {
                'nombre': 'Marcha estática con apoyo',
                'descripcion': 'Entrenamiento de equilibrio en bipedestación con apoyo bilateral.',
                'categoria': CategoriaEjercicio.EQUILIBRIO,
                'estado': EstadoPublicacion.PUBLICADO,
                'mov_min': '3',
                'mov_max': '5',
                'territorios': [TerritorioACV.BILATERAL],
                'etiquetas': ['Equilibrio', 'Marcha'],
                'thumbnail_url': img_caminar,
                'series': 4,
                'repeticiones': 8,
            },
            {
                'nombre': 'Ejercicio pendiente de validación',
                'descripcion': 'Ejemplo en cola de validación por pares.',
                'categoria': CategoriaEjercicio.POSTURAL,
                'estado': EstadoPublicacion.PENDIENTE_VALIDACION,
                'mov_min': '1',
                'mov_max': '5',
                'territorios': [],
                'etiquetas': ['Higiene postural'],
                'thumbnail_url': img_yoga,
                'series': 2,
                'repeticiones': 10,
            },
            {
                'nombre': 'Borrador — extensión de tronco',
                'descripcion': 'Borrador no listado como publicado.',
                'categoria': CategoriaEjercicio.GENERAL,
                'estado': EstadoPublicacion.BORRADOR,
                'mov_min': '1',
                'mov_max': '3',
                'territorios': [],
                'etiquetas': [],
                'thumbnail_url': img_yoga,
                'series': 3,
                'repeticiones': 8,
            },
            {
                'nombre': 'Respiración diafragmática guiada',
                'descripcion': 'Control ventilatorio en decúbito supino; útil en fases agudas y subagudas.',
                'categoria': CategoriaEjercicio.CARDIO,
                'estado': EstadoPublicacion.PUBLICADO,
                'mov_min': '1',
                'mov_max': '5',
                'territorios': [TerritorioACV.CUALQUIERA],
                'etiquetas': ['Neurología ACV', 'Respiratorio'],
                'thumbnail_url': img_yoga,
                'series': 2,
                'repeticiones': 6,
            },
            {
                'nombre': 'Flexión de rodilla con banda elástica',
                'descripcion': 'Cuádriceps en sedestación con banda; progresar resistencia según tolerancia.',
                'categoria': CategoriaEjercicio.FUERZA,
                'estado': EstadoPublicacion.PUBLICADO,
                'mov_min': '2',
                'mov_max': '5',
                'territorios': [TerritorioACV.CUALQUIERA],
                'etiquetas': ['Rodilla', 'Banda'],
                'thumbnail_url': img_fuerza,
                'series': 3,
                'repeticiones': 15,
            },
            {
                'nombre': 'Transferencia simulada cama-silla',
                'descripcion': 'Entrenamiento funcional de transferencia con ayuda mínima y verbalización de pasos.',
                'categoria': CategoriaEjercicio.GENERAL,
                'estado': EstadoPublicacion.PUBLICADO,
                'mov_min': '2',
                'mov_max': '4',
                'territorios': [TerritorioACV.HEMISFERIO_IZQUIERDO, TerritorioACV.CUALQUIERA],
                'etiquetas': ['ADL', 'Funcional'],
                'thumbnail_url': img_caminar,
                'series': 2,
                'repeticiones': 5,
            },
            {
                'nombre': 'Alcance controlado en plano sagital',
                'descripcion': 'Miembro superior afecto: alcance anticipado con base estable y feedback visual.',
                'categoria': CategoriaEjercicio.MOVILIDAD,
                'estado': EstadoPublicacion.PUBLICADO,
                'mov_min': '2',
                'mov_max': '5',
                'territorios': [TerritorioACV.HEMISFERIO_DERECHO],
                'etiquetas': ['Miembro superior', 'ACV'],
                'thumbnail_url': img_brazos,
                'series': 3,
                'repeticiones': 10,
            },
            {
                'nombre': 'Estabilización de tobillo en unipodal asistido',
                'descripcion': 'Propiocepción TOB en apoyo unipodal con contacto fingertip en pared.',
                'categoria': CategoriaEjercicio.EQUILIBRIO,
                'estado': EstadoPublicacion.PUBLICADO,
                'mov_min': '3',
                'mov_max': '5',
                'territorios': [],
                'etiquetas': ['Tobillo', 'Propiocepción'],
                'thumbnail_url': img_caminar,
                'series': 3,
                'repeticiones': 8,
            },
        ]

        demo_video = 'https://example.org/videos/ejercicio-demo-placeholder.mp4'

        for row in ejemplos:
            obj, created = Ejercicio.objects.update_or_create(
                nombre=row['nombre'],
                defaults={
                    'descripcion': row['descripcion'],
                    'series': row.get('series', 3),
                    'repeticiones': row.get('repeticiones', 10),
                    'tiempo_segundos': 45,
                    'url_video': demo_video,
                    'thumbnail_url': row.get('thumbnail_url'),
                    'evidencia_cientifica': ev_base,
                    'referencias_bibliograficas': [
                        {'tipo': 'link', 'url': 'https://example.org/rehab-2023', 'titulo': 'Guía demo'},
                    ],
                    'estado_publicacion': row['estado'],
                    'creador': admin,
                    'movilidad_paciente_min': row['mov_min'],
                    'movilidad_paciente_max': row['mov_max'],
                    'territorios_acv_compatibles': row['territorios'],
                    'categoria': row['categoria'],
                    'etiquetas_clinicas': row['etiquetas'],
                },
            )
            if created:
                self.stdout.write(f'  + ejercicio: {row["nombre"]}')
            else:
                self.stdout.write(f'  · actualizado: {row["nombre"]}')

        self.stdout.write(
            self.style.SUCCESS(
                'seed_demo: listo. Cuentas (contraseña demo12345): admin@demo.rehab | '
                'terapeuta@demo.rehab | paciente1@demo.rehab | paciente2@demo.rehab. '
                'Tokens DRF creados para admin y terapeuta; login: POST /api/auth/token/ '
                'con {"username":"<email>","password":"demo12345"}.'
            )
        )
