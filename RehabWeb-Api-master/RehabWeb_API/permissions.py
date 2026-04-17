"""
Custom permissions for RehabWeb_API.

Define your custom permission classes here.
"""

from rest_framework import permissions
from .models import RolUsuario

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
