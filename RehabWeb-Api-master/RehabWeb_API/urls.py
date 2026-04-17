"""
URL configuration for RehabWeb_API project.
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token
from rest_framework.routers import DefaultRouter
from RehabWeb_API.views import EjercicioViewSet, PacienteViewSet

router = DefaultRouter()
router.register(r'ejercicios', EjercicioViewSet, basename='ejercicio')
router.register(r'pacientes', PacienteViewSet, basename='paciente')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api-auth/', include('rest_framework.urls')),
    path('api/auth/token/', obtain_auth_token),
    path('api/', include(router.urls)),
]
