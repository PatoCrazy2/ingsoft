"""
Custom permissions for RehabWeb_API.

Define your custom permission classes here.
"""

from rest_framework import permissions

from .models import EstadoPublicacion, RolUsuario

class IsAdminRol(permissions.BasePermission):
    """
    Permiso para usuarios con rol de Administrador.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.rol == RolUsuario.ADMIN
        )

class IsTerapeutaRol(permissions.BasePermission):
    """
    Permiso para usuarios con rol de Terapeuta.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.rol == RolUsuario.TERAPEUTA
        )


class IsTerapeutaOrAdmin(permissions.BasePermission):
    """Terapeuta o Administrador."""
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.rol in (RolUsuario.TERAPEUTA, RolUsuario.ADMIN)
        )


class CanEditEjercicioCatalogo(permissions.BasePermission):
    """
    Admin: cualquier ejercicio.
    Terapeuta: solo los propios que aún no estén publicados (borrador / pendiente).
    """

    def has_object_permission(self, request, view, obj):
        u = request.user
        if not u.is_authenticated:
            return False
        if getattr(u, 'rol', None) == RolUsuario.ADMIN:
            return True
        if getattr(u, 'rol', None) != RolUsuario.TERAPEUTA:
            return False
        if obj.creador_id != u.pk:
            return False
        return obj.estado_publicacion != EstadoPublicacion.PUBLICADO


class CanPreviewEjercicio(permissions.BasePermission):
    """Vista previa: admin todo; resto publicados; terapeuta además sus borradores/pendientes."""

    def has_object_permission(self, request, view, obj):
        u = request.user
        if not u.is_authenticated:
            return False
        if getattr(u, 'rol', None) == RolUsuario.ADMIN:
            return True
        if obj.estado_publicacion == EstadoPublicacion.PUBLICADO:
            return True
        if getattr(u, 'rol', None) == RolUsuario.TERAPEUTA and obj.creador_id == u.pk:
            return True
        return False
