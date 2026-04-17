"""
URL configuration for RehabWeb_API project.
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from RehabWeb_API.views import EjercicioViewSet

router = DefaultRouter()
router.register(r'ejercicios', EjercicioViewSet, basename='ejercicio')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api-auth/', include('rest_framework.urls')),
    path('api/', include(router.urls)),
]
