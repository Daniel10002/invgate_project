 # backend/profiles/models.py
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save # Mantén la importación si la usas en otros lugares, si no, elimínala
from django.dispatch import receiver # Mantén la importación si la usas en otros lugares, si no, elimínala
from django.utils import timezone

class UserProfile(models.Model):
        user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
        full_name = models.CharField(max_length=255, blank=True, null=True, verbose_name="Nombre Completo")
        position = models.CharField(max_length=100, blank=True, null=True, verbose_name="Cargo")
        area = models.CharField(max_length=100, blank=True, null=True, verbose_name="Área")
        phone_number = models.CharField(max_length=20, blank=True, null=True, verbose_name="Número de Teléfono")
        location = models.CharField(max_length=200, blank=True, null=True, verbose_name="Ubicación/Oficina")
        last_login_at = models.DateTimeField(null=True, blank=True, verbose_name="Última Conexión")
        
        def __str__(self):
            return f"Perfil de {self.user.username}"

    # ELIMINA ESTE BLOQUE COMPLETO:
    # @receiver(post_save, sender=User)
    # def create_or_update_user_profile(sender, instance, created, **kwargs):
    #     if created:
    #         UserProfile.objects.create(user=instance)
    #     instance.userprofile.save()
    