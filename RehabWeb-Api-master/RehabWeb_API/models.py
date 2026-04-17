import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

# --- Enums / Choices ---

class RolUsuario(models.TextChoices):
    PACIENTE = 'Paciente', 'Paciente'
    TERAPEUTA = 'Terapeuta', 'Terapeuta'
    ADMIN = 'Admin', 'Admin'

class EstadoPaciente(models.TextChoices):
    ACTIVO = 'Activo', 'Activo'
    INACTIVO = 'Inactivo', 'Inactivo'

class NivelDificultad(models.TextChoices):
    BAJO = 'BAJO', 'Bajo'
    MEDIO = 'MEDIO', 'Medio'
    ALTO = 'ALTO', 'Alto'

class EstadoAsignacion(models.TextChoices):
    ASIGNADA = 'Asignada', 'Asignada'
    EN_PROGRESO = 'En progreso', 'En progreso'
    COMPLETADA = 'Completada', 'Completada'

class NivelMovilidad(models.TextChoices):
    NIVEL_1 = '1', 'Nivel 1 - Muy Limitado'
    NIVEL_2 = '2', 'Nivel 2 - Limitado'
    NIVEL_3 = '3', 'Nivel 3 - Moderado'
    NIVEL_4 = '4', 'Nivel 4 - Autónomo'

# --- Manager para Usuario ---

class UsuarioManager(BaseUserManager):
    def create_user(self, email, nombre_completo, password=None, **extra_fields):
        if not email:
            raise ValueError('El usuario debe tener un correo electrónico')
        email = self.normalize_email(email)
        user = self.model(email=email, nombre_completo=nombre_completo, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, nombre_completo, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('rol', RolUsuario.ADMIN)
        return self.create_user(email, nombre_completo, password, **extra_fields)

# --- Entidades Base ---

class Usuario(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre_completo = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    rol = models.CharField(max_length=20, choices=RolUsuario.choices, default=RolUsuario.PACIENTE)
    
    google_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    facebook_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UsuarioManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nombre_completo']

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def __str__(self):
        return f"{self.nombre_completo} ({self.rol})"

class Terapeuta(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, primary_key=True, related_name='perfil_terapeuta')
    # Nota: El ID se comparte con Usuario gracias a primary_key=True
    especialidad = models.CharField(max_length=255)
    numero_licencia = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return f"Terapeuta: {self.usuario.nombre_completo}"

class PerfilClinico(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    diagnostico_principal = models.CharField(max_length=255)
    historial_medico = models.TextField()
    nivel_movilidad = models.CharField(max_length=20, choices=NivelMovilidad.choices)
    restricciones = models.TextField()

    def __str__(self):
        return f"Perfil: {self.diagnostico_principal}"

class Paciente(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, primary_key=True, related_name='perfil_paciente')
    terapeuta = models.ForeignKey(Terapeuta, on_delete=models.CASCADE, related_name='pacientes')
    perfil_clinico = models.OneToOneField(PerfilClinico, on_delete=models.CASCADE, null=True, blank=True)
    
    fecha_nacimiento = models.DateField(null=True, blank=True)
    estado = models.CharField(max_length=20, choices=EstadoPaciente.choices, default=EstadoPaciente.ACTIVO)
    
    estrategia_validacion = models.CharField(max_length=100)
    estrategia_progreso = models.CharField(max_length=100)

    def __str__(self):
        return f"Paciente: {self.usuario.nombre_completo}"

# --- Entidades de Tratamiento ---

class Rutina(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField(null=True, blank=True)
    nivel_dificultad = models.CharField(max_length=20, choices=NivelDificultad.choices)
    terapeuta_creador = models.ForeignKey(Terapeuta, on_delete=models.CASCADE, related_name='rutinas_creadas')

    def __str__(self):
        return self.nombre

class Ejercicio(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField()
    series = models.IntegerField()
    repeticiones = models.IntegerField()
    tiempo_segundos = models.IntegerField(null=True, blank=True)
    url_video = models.URLField(null=True, blank=True)

    def __str__(self):
        return self.nombre

class RutinaEjercicio(models.Model):
    rutina = models.ForeignKey(Rutina, on_delete=models.CASCADE, related_name='ejercicios_asociados')
    ejercicio = models.ForeignKey(Ejercicio, on_delete=models.CASCADE)
    orden = models.IntegerField()

    class Meta:
        unique_together = ('rutina', 'ejercicio')
        ordering = ['orden']

class AsignacionRutina(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name='asignaciones')
    rutina = models.ForeignKey(Rutina, on_delete=models.CASCADE)
    terapeuta_asignador = models.ForeignKey(Terapeuta, on_delete=models.CASCADE)
    fecha_asignacion = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, choices=EstadoAsignacion.choices, default=EstadoAsignacion.ASIGNADA)

    def __str__(self):
        return f"Asignación: {self.rutina.nombre} -> {self.paciente.usuario.nombre_completo}"

# --- Seguimiento y Auditoría ---

class SesionDeRehabilitacion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    asignacion_rutina = models.ForeignKey(AsignacionRutina, on_delete=models.CASCADE, related_name='sesiones')
    fecha_completada = models.DateTimeField()
    duracion_minutos = models.IntegerField()
    percepcion_esfuerzo = models.IntegerField() # Escala 1-10 p.ej.
    feedback_paciente = models.TextField(null=True, blank=True)

class EvaluacionClinica(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name='evaluaciones')
    terapeuta_evaluador = models.ForeignKey(Terapeuta, on_delete=models.CASCADE)
    fecha_evaluacion = models.DateTimeField()
    notas_evaluacion = models.TextField()
    metricas_objetivas = models.JSONField() # Soporta JSON nativo en MySQL 8.0/Postgres

class Auditoria(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    accion = models.CharField(max_length=255)
    entidad_afectada = models.CharField(max_length=100)
    entidad_id = models.UUIDField()
    datos_previos = models.JSONField(null=True, blank=True)
    datos_nuevos = models.JSONField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
