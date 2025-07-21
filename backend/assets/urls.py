    # backend/assets/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AssetViewSet # Solo importamos AssetViewSet

router = DefaultRouter()
router.register(r'assets', AssetViewSet)
    # router.register(r'users', UserViewSet) # ¡ELIMINADO!

urlpatterns = [
        path('', include(router.urls)),
    ]