# backend/profiles/views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from django.contrib.auth import get_user_model
from .serializers import UserSerializer # Importa el UserSerializer de profiles
from .models import UserProfile
    # No importar Doctor ni ImagingRequest aquí, ya que ImagingRequestViewSet no estará aquí.
    # from medical.models import Doctor 
    # from medical.models import ImagingRequest # ¡ELIMINAR ESTA LÍNEA SI EXISTE!

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
        queryset = User.objects.all().select_related('userprofile', 'doctor')
        serializer_class = UserSerializer
        authentication_classes = [TokenAuthentication]
        permission_classes = [IsAuthenticated]

        def get_queryset(self):
            queryset = super().get_queryset()
            user = self.request.user
            
            if user.is_staff:
                return queryset
            
            return queryset.filter(pk=user.pk)

    # ELIMINA CUALQUIER OTRA CLASE DE VISTA RELACIONADA CON IMAGENOLOGÍA AQUÍ
    # Por ejemplo, si tenías:
    # class ImagingRequestViewSet(viewsets.ModelViewSet):
    #    queryset = ImagingRequest.objects.filter(is_deleted=False).select_related('doctor')
    #    # ... ¡ELIMINA TODO ESTE BLOQUE!
