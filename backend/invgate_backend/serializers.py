# C:\invgate_project\backend\invgate_backend\serializers.py

from rest_framework import serializers
from rest_framework.authtoken.serializers import AuthTokenSerializer as BaseAuthTokenSerializer
from django.contrib.auth import get_user_model

# IMPORTANTE: Asegúrate de que esta ruta sea correcta para tu UserProfileSerializer.
from profiles.serializers import UserProfileSerializer

User = get_user_model()

# Serializer para el modelo User
class UserSerializer(serializers.ModelSerializer):
    # --- CAMBIO CLAVE AQUÍ: Usamos SerializerMethodField para user_profile ---
    user_profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'is_staff', 'user_profile')

    # Método para obtener los datos del user_profile
    def get_user_profile(self, obj):
        # obj es la instancia del User que se está serializando
        # Intentamos obtener el perfil relacionado. Si no existe, devuelve None.
        if hasattr(obj, 'userprofile') and obj.userprofile is not None:
            return UserProfileSerializer(obj.userprofile).data
        return None # Retorna None si el perfil no existe o es nulo

# Este es el serializer que se usa en el endpoint de autenticación (login).
class AuthTokenSerializer(BaseAuthTokenSerializer):
    class Meta:
        fields = ['username', 'password']