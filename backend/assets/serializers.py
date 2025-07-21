# backend/assets/serializers.py
from rest_framework import serializers
from .models import Asset # Solo importamos el modelo Asset

# Este archivo SOLO debe contener serializadores para los modelos de la app 'assets'.
# No debe haber User, UserProfile, ni Doctor serializers aquí.

class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = '__all__' # O los campos específicos de tu modelo Asset

# Asegúrate de que NO haya más código de serializadores de usuario aquí.
# Si tenías UserProfileSerializer o UserSerializer aquí, ya han sido movidos (o deben ser movidos)
# a backend/profiles/serializers.py.
