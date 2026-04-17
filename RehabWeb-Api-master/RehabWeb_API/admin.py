from django.contrib import admin
from .models import (
    Usuario, Terapeuta, Paciente, PerfilClinico, 
    Rutina, Ejercicio, RutinaEjercicio, 
    AsignacionRutina, SesionDeRehabilitacion, 
    EvaluacionClinica, Auditoria
)

@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('email', 'nombre_completo', 'rol', 'is_active')
    search_fields = ('email', 'nombre_completo')
    list_filter = ('rol', 'is_active')

@admin.register(Terapeuta)
class TerapeutaAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'especialidad', 'numero_licencia')
    search_fields = ('usuario__nombre_completo', 'numero_licencia')

@admin.register(Paciente)
class PacienteAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'terapeuta', 'estado')
    search_fields = ('usuario__nombre_completo',)
    list_filter = ('estado',)

@admin.register(PerfilClinico)
class PerfilClinicoAdmin(admin.ModelAdmin):
    list_display = ('diagnostico_principal', 'nivel_movilidad')

@admin.register(Rutina)
class RutinaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'nivel_dificultad', 'terapeuta_creador')
    search_fields = ('nombre',)
    list_filter = ('nivel_dificultad',)

@admin.register(Ejercicio)
class EjercicioAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'series', 'repeticiones')
    search_fields = ('nombre',)

@admin.register(RutinaEjercicio)
class RutinaEjercicioAdmin(admin.ModelAdmin):
    list_display = ('rutina', 'ejercicio', 'orden')

@admin.register(AsignacionRutina)
class AsignacionRutinaAdmin(admin.ModelAdmin):
    list_display = ('paciente', 'rutina', 'estado', 'fecha_asignacion')
    list_filter = ('estado',)

@admin.register(SesionDeRehabilitacion)
class SesionDeRehabilitacionAdmin(admin.ModelAdmin):
    list_display = ('asignacion_rutina', 'fecha_completada', 'duracion_minutos')

@admin.register(EvaluacionClinica)
class EvaluacionClinicaAdmin(admin.ModelAdmin):
    list_display = ('paciente', 'terapeuta_evaluador', 'fecha_evaluacion')

@admin.register(Auditoria)
class AuditoriaAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'accion', 'entidad_afectada', 'timestamp')
    readonly_fields = ('timestamp',)
