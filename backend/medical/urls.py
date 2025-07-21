# backend/medical/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
    # Importa solo los ViewSets que realmente están definidos en medical.views
from .views import (
        ExamCategoryViewSet,
        ExamItemViewSet,
        ImagingRequestViewSet,
        generate_imaging_request_pdf # La vista de función para el PDF
    )

router = DefaultRouter()
router.register(r'exam-categories', ExamCategoryViewSet)
router.register(r'exam-items', ExamItemViewSet)
router.register(r'imaging-requests', ImagingRequestViewSet)
    # Ya no registramos DoctorViewSet aquí porque está en profiles.urls

urlpatterns = [
        path('', include(router.urls)),
        # Añade la URL para la generación de PDF
        path('imaging-requests/<int:pk>/generate_pdf/', generate_imaging_request_pdf, name='generate_imaging_request_pdf'),
    ]
    