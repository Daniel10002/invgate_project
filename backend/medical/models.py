# backend/medical/models.py
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from simple_history.models import HistoricalRecords

class Doctor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name='doctor')
    # CAMBIO CLAVE: Permite blank=True y null=True para full_name y medical_license
    full_name = models.CharField(max_length=255, verbose_name="Nombre Completo", blank=True, null=True)
    specialty = models.CharField(max_length=100, blank=True, null=True, verbose_name="Especialidad")
    medical_license = models.CharField(max_length=50, unique=True, verbose_name="Licencia Médica", blank=True, null=True) # <-- CAMBIO CLAVE AQUÍ
    phone_number = models.CharField(max_length=20, blank=True, null=True, verbose_name="Teléfono")

    def __str__(self):
        return self.full_name

class ExamCategory(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Categoría de Examen")
    order = models.IntegerField(default=0)

    class Meta:
        verbose_name = "Categoría de Examen"
        verbose_name_plural = "Categorías de Exámenes"
        ordering = ['order', 'name']

    def __str__(self):
        return self.name

class ExamItem(models.Model):
    category = models.ForeignKey(ExamCategory, on_delete=models.CASCADE, related_name='exam_items', verbose_name="Categoría")
    name = models.CharField(max_length=255, verbose_name="Nombre del Examen")
    code = models.CharField(max_length=20, unique=True, verbose_name="Código de Examen")
    description = models.TextField(blank=True, null=True, verbose_name="Descripción")

    class Meta:
        verbose_name = "Ítem de Examen"
        verbose_name_plural = "Ítems de Examen"
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"

class ImagingRequest(models.Model):
    patient_name = models.CharField(max_length=255, verbose_name="Nombre del Paciente")
    patient_rut = models.CharField(max_length=20, verbose_name="RUT del Paciente")
    patient_phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Teléfono del Paciente")
    patient_prevencion = models.CharField(max_length=100, blank=True, null=True, verbose_name="Tipo Previsión")
    request_date = models.DateField(default=timezone.now, verbose_name="Fecha de Solicitud")
    doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, blank=True, related_name='imaging_requests', verbose_name="Médico Solicitante")
    diagnosis = models.TextField(blank=True, null=True, verbose_name="Diagnóstico")
    observations = models.TextField(blank=True, null=True, verbose_name="Observaciones / Justificación")
    selected_exams = models.ManyToManyField(ExamItem, blank=True, related_name='imaging_requests', verbose_name="Exámenes Seleccionados")

    is_deleted = models.BooleanField(default=False)

    history = HistoricalRecords()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Solicitud de Imagenología"
        verbose_name_plural = "Solicitudes de Imagenología"
        ordering = ['-request_date', 'patient_name']

    def __str__(self):
        return f"Solicitud de {self.patient_name} ({self.request_date})"

