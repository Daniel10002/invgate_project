# backend/medical/views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404 
from .models import Doctor, ExamCategory, ExamItem, ImagingRequest 
from .serializers import (
    ExamCategorySerializer, 
    ExamItemSerializer, 
    ImagingRequestSerializer
)
from profiles.serializers import DoctorSerializer as ProfileDoctorSerializer

from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from django_filters.rest_framework import DjangoFilterBackend

from django.http import HttpResponse 
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image 
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.colors import black, grey 

# CAMBIO CLAVE: Importar settings y os para la ruta del logo
from django.conf import settings 
import os 


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = ProfileDoctorSerializer 
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

class ExamCategoryViewSet(viewsets.ModelViewSet):
    queryset = ExamCategory.objects.all().prefetch_related('exam_items') 
    serializer_class = ExamCategorySerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

class ExamItemViewSet(viewsets.ModelViewSet):
    queryset = ExamItem.objects.all()
    serializer_class = ExamItemSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

class ImagingRequestViewSet(viewsets.ModelViewSet):
    queryset = ImagingRequest.objects.filter(is_deleted=False).select_related('doctor') 
    serializer_class = ImagingRequestSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['doctor']

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        if user.is_staff:
            return ImagingRequest.objects.all().select_related('doctor') 
        
        if hasattr(user, 'doctor') and user.doctor: 
            return queryset.filter(doctor=user.doctor) 
        
        return queryset.none()
    
    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.is_deleted = True 
            instance.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        serializer.save() 

    def perform_update(self, serializer):
        serializer.save()


# Función para generar el PDF de la solicitud de imagenología
def generate_imaging_request_pdf(request, pk):
    try:
        imaging_request = get_object_or_404(ImagingRequest, pk=pk)
    except Exception as e:
        return HttpResponse(f"Error interno al obtener la solicitud: {e}", status=500)

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="solicitud_imagenologia_{imaging_request.pk}.pdf"'

    # CAMBIO CLAVE AQUÍ: Ajustar los márgenes del documento
    # leftMargin, rightMargin, topMargin, bottomMargin
    # Reducimos topMargin para que el contenido empiece más arriba
    doc = SimpleDocTemplate(response, pagesize=letter,
                            leftMargin=0.7 * inch, rightMargin=0.7 * inch,
                            topMargin=0.5 * inch, bottomMargin=0.5 * inch) # Ajusta topMargin a un valor menor
    elements = []
    styles = getSampleStyleSheet()

    # Definir o modificar estilos
    styles['Normal'].fontSize = 10
    styles['Normal'].leading = 12
    styles['Normal'].alignment = TA_LEFT
    styles['Normal'].fontName = 'Helvetica'

    styles['h1'].fontSize = 18
    styles['h1'].leading = 22
    styles['h1'].alignment = TA_CENTER
    styles['h1'].fontName = 'Helvetica-Bold'

    styles.add(ParagraphStyle(name='HeaderStyle', fontSize=10, leading=12, alignment=TA_LEFT, fontName='Helvetica-Bold'))
    styles.add(ParagraphStyle(name='HeaderRightStyle', fontSize=9, leading=11, alignment=TA_RIGHT, fontName='Helvetica'))
    styles.add(ParagraphStyle(name='TitleStyle', fontSize=18, leading=22, alignment=TA_CENTER, fontName='Helvetica-Bold'))
    styles.add(ParagraphStyle(name='SectionHeader', fontSize=12, leading=14, alignment=TA_LEFT, fontName='Helvetica-Bold', spaceBefore=10, spaceAfter=5))
    styles.add(ParagraphStyle(name='LabelText', fontSize=10, leading=12, alignment=TA_LEFT, fontName='Helvetica-Bold'))
    styles.add(ParagraphStyle(name='ValueText', fontSize=10, leading=12, alignment=TA_LEFT, fontName='Helvetica'))
    styles.add(ParagraphStyle(name='SignatureText', fontSize=9, leading=11, alignment=TA_CENTER, fontName='Helvetica'))
    styles.add(ParagraphStyle(name='SignatureBold', fontSize=9, leading=11, alignment=TA_CENTER, fontName='Helvetica-Bold'))


    # --- Encabezado ---
    doctor_name = imaging_request.doctor.full_name if imaging_request.doctor else "N/A"
    
    logo_path = os.path.join(settings.BASE_DIR, 'invgate_backend', 'static', 'images', 'descarga.png')

    try:
        logo = Image(logo_path, width=1.5 * inch, height=0.5 * inch) 
    except Exception as e:
        print(f"Error al cargar el logo: {e}") 
        logo = Paragraph("LOGO NO DISPONIBLE", styles['HeaderStyle']) 

    header_data = [
        [
            logo,  
            Paragraph(f"Dr(a). {doctor_name}<br/>Folio: {imaging_request.id}", styles['HeaderRightStyle']) 
        ]
    ]
    header_table = Table(header_data, colWidths=[1.5 * inch, 3.0 * inch, 2.6 * inch]) 
    header_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (0,-1), 'LEFT'),   
        ('ALIGN', (1,0), (1,-1), 'LEFT'),   
        ('ALIGN', (2,0), (2,-1), 'RIGHT'),  
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 0.1 * inch)) # CAMBIO CLAVE: Reducir este Spacer

    # --- Título Principal ---
    elements.append(Paragraph("Solicitud de Exámenes Imagenología", styles['TitleStyle']))
    elements.append(Spacer(1, 0.2 * inch)) # CAMBIO CLAVE: Reducir este Spacer

    # --- Sección de Datos del Paciente ---
    elements.append(Paragraph("Datos del Paciente:", styles['SectionHeader']))
    patient_data = [
        [Paragraph("<b>Nombre Completo:</b>", styles['LabelText']), Paragraph(imaging_request.patient_name, styles['ValueText']),
         Paragraph("<b>RUT:</b>", styles['LabelText']), Paragraph(imaging_request.patient_rut, styles['ValueText'])],
        [Paragraph("<b>Fecha de Solicitud:</b>", styles['LabelText']), Paragraph(imaging_request.request_date.strftime('%d/%m/%Y'), styles['ValueText']),
         Paragraph("<b>Teléfono:</b>", styles['LabelText']), Paragraph(imaging_request.patient_phone or 'N/A', styles['ValueText'])],
        [Paragraph("<b>Tipo Previsión:</b>", styles['LabelText']), Paragraph(imaging_request.patient_prevencion or 'N/A', styles['ValueText']),
         Paragraph("<b>Diagnóstico:</b>", styles['LabelText']), Paragraph(imaging_request.diagnosis or 'N/A', styles['ValueText'])]
    ]
    patient_table = Table(patient_data, colWidths=[1.5 * inch, 2.0 * inch, 1.0 * inch, 2.0 * inch])
    patient_table.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, grey), # Cuadrícula ligera
        ('BOX', (0,0), (-1,-1), 1, black),   # Borde exterior
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ]))
    elements.append(patient_table)
    elements.append(Spacer(1, 0.3 * inch))

    # --- Sección de Exámenes Solicitados ---
    elements.append(Paragraph("Lista de Exámenes:", styles['SectionHeader']))
    if imaging_request.selected_exams.exists():
        for exam in imaging_request.selected_exams.all():
            elements.append(Paragraph(f"- {exam.name.upper()} ({exam.code})", styles['BodyText']))
            elements.append(Spacer(1, 0.05 * inch))
    else:
        elements.append(Paragraph("Ningún examen seleccionado.", styles['BodyText']))
    elements.append(Spacer(1, 0.3 * inch))

    # --- Sección de Observaciones / Justificación ---
    elements.append(Paragraph("Observaciones / Justificación", styles['SectionHeader']))
    elements.append(Paragraph(imaging_request.observations or "N/A", styles['BodyText']))
    elements.append(Spacer(1, 0.5 * inch))

    # --- Sección de Firmas ---
    # Asegurarse de que doctor_name esté definido incluso si imaging_request.doctor es None
    doctor_name_for_signature = imaging_request.doctor.full_name if imaging_request.doctor else "N/A"

    signature_data = [
        [Paragraph("_________________________<br/>Fecha", styles['SignatureText']),
         Paragraph("_________________________<br/>Firma", styles['SignatureText'])],
        [Paragraph(imaging_request.request_date.strftime('%d-%m-%Y'), styles['SignatureBold']),
         Paragraph(f"Dr(a). {doctor_name_for_signature}", styles['SignatureBold'])]
    ]
    signature_table = Table(signature_data, colWidths=[3.5 * inch, 3.5 * inch])
    signature_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
    ]))
    elements.append(signature_table)
    elements.append(Spacer(1, 0.5 * inch))

    doc.build(elements)

    return response