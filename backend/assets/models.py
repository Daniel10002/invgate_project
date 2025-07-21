from django.db import models

class Asset(models.Model):
    ASSET_TYPES = [
        ('computer', 'Computadora'),
        ('software', 'Software'),
        ('contract', 'Contrato'),
        ('network_device', 'Dispositivo de Red'),
        ('server', 'Servidor'),
        ('printer', 'Impresora'),
        ('mobile_device', 'Dispositivo Móvil'),
        ('peripheral', 'Periférico'),
        ('other', 'Otro'),
    ]

    name = models.CharField(max_length=200, verbose_name="Nombre del Activo")
    asset_id = models.CharField(max_length=50, unique=True, verbose_name="ID del Activo")
    asset_type = models.CharField(
        max_length=20,
        choices=ASSET_TYPES,
        default='computer',
        verbose_name="Tipo de Activo"
    )
    description = models.TextField(blank=True, null=True, verbose_name="Descripción")
    status = models.CharField(max_length=50, default='Activo', verbose_name="Estado")
    connectivity = models.BooleanField(default=True, verbose_name="Conectividad (Online)")
    antivirus_enabled = models.BooleanField(default=True, verbose_name="Antivirus Habilitado")
    purchase_date = models.DateField(null=True, blank=True, verbose_name="Fecha de Compra")
    warranty_expiry_date = models.DateField(null=True, blank=True, verbose_name="Fin de Garantía")
    contract_number = models.CharField(max_length=100, blank=True, null=True, verbose_name="Número de Contrato")
    location = models.CharField(max_length=200, blank=True, null=True, verbose_name="Ubicación Física")
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name="Dirección IP")
    mac_address = models.CharField(max_length=17, blank=True, null=True, verbose_name="Dirección MAC")
    assigned_to = models.CharField(max_length=100, blank=True, null=True, verbose_name="Asignado A")

    class Meta:
        verbose_name = "Activo de TI"
        verbose_name_plural = "Activos de TI"
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.asset_id})"