from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
    # from django.contrib.auth.models import User # ¡ELIMINADO!

    # Importaciones de permisos personalizados
from .permissions import IsAdminUserOrOwner

    # Importaciones de Modelos (SOLO de assets.models)
from .models import Asset

    # Importaciones de Serializadores (SOLO de assets.serializers)
from .serializers import AssetSerializer # Solo importamos AssetSerializer
    # from .serializers import UserSerializer # ¡ELIMINADO!


class AssetViewSet(viewsets.ModelViewSet):
        queryset = Asset.objects.all()
        serializer_class = AssetSerializer
        filter_backends = [filters.SearchFilter]
        search_fields = ['name', 'asset_id', 'asset_type', 'location', 'assigned_to', 'status', 'description']

    # class UserViewSet(viewsets.ModelViewSet): # ¡ELIMINADO TODO ESTE BLOQUE!
    #     queryset = User.objects.all().order_by('username')
    #     serializer_class = UserSerializer
    #     permission_classes = [IsAdminUserOrOwner]
    #     filter_backends = [filters.SearchFilter]
    #     search_fields = ['username', 'email']
    