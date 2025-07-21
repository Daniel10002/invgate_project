from django.contrib import admin
from .models import UserProfile # Importa tu modelo UserProfile

# Registra tu modelo UserProfile
admin.site.register(UserProfile)