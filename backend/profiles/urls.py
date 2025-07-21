# backend/profiles/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet # Importa el ViewSet que crearemos

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='users') # Registra el ViewSet de usuarios

urlpatterns = [
    path('', include(router.urls)),
]