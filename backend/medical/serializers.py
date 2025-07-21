# backend/medical/serializers.py
from rest_framework import serializers
from .models import Doctor, ExamCategory, ExamItem, ImagingRequest

# Importa DoctorSerializer desde profiles para usarlo anidado
from profiles.serializers import DoctorSerializer as ProfileDoctorSerializer

# Serializer para ExamItem
class ExamItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True) 
    class Meta:
        model = ExamItem
        fields = '__all__'
        
# Serializer para ExamCategory
class ExamCategorySerializer(serializers.ModelSerializer):
    exam_items = ExamItemSerializer(many=True, read_only=True) 

    class Meta:
        model = ExamCategory
        fields = '__all__'

# Serializer para ImagingRequest
class ImagingRequestSerializer(serializers.ModelSerializer):
    doctor_name = serializers.SerializerMethodField()
    selected_exams = serializers.PrimaryKeyRelatedField(queryset=ExamItem.objects.all(), many=True, required=False)

    class Meta:
        model = ImagingRequest
        fields = '__all__' 

    def get_doctor_name(self, obj):
        return obj.doctor.full_name if obj.doctor else "N/A"

    def create(self, validated_data):
        selected_exams_data = validated_data.pop('selected_exams', [])
        
        # --- Lógica de asignación del doctor en CREATE ---
        # 1. Intentar obtener el doctor de la data validada (si el frontend lo envió)
        doctor_obj = validated_data.get('doctor', None)

        # 2. Si el doctor no se envió o se envió como None, intentar asignarlo desde el usuario autenticado
        if doctor_obj is None:
            user = self.context['request'].user
            if user.is_authenticated:
                try:
                    # Obtener el objeto Doctor directamente de la base de datos para el usuario autenticado
                    doctor_obj = Doctor.objects.get(user=user)
                    validated_data['doctor'] = doctor_obj # Asignar el objeto Doctor encontrado
                except Doctor.DoesNotExist:
                    validated_data['doctor'] = None # Si el usuario no es doctor, no asignar
            else:
                validated_data['doctor'] = None # Si no hay usuario autenticado, no asignar
        else:
            # Si el doctor_obj no es None (es decir, el frontend envió un ID),
            # asegúrate de que sea un objeto Doctor, no solo un ID.
            # Django REST Framework debería manejar esto si es un PrimaryKeyRelatedField,
            # pero si hay dudas, podrías buscarlo aquí.
            # Sin embargo, con PrimaryKeyRelatedField, validated_data['doctor'] ya sería el objeto Doctor.
            pass # No hacer nada, ya está en validated_data

        # Crear la solicitud de imagenología
        imaging_request = ImagingRequest.objects.create(**validated_data)
        imaging_request.selected_exams.set(selected_exams_data)
        
        imaging_request.refresh_from_db() 
        return imaging_request

    def update(self, instance, validated_data):
        selected_exams_data = validated_data.pop('selected_exams', None)

        # --- Lógica de asignación del doctor en UPDATE ---
        # 1. Intentar obtener el doctor de la data validada (si el frontend lo envió)
        doctor_obj_from_data = validated_data.get('doctor', None)

        # 2. Si el doctor no se envió o se envió como None, intentar asignarlo desde el usuario autenticado
        if doctor_obj_from_data is None:
            user = self.context['request'].user
            if user.is_authenticated:
                try:
                    doctor_obj_authenticated = Doctor.objects.get(user=user)
                    # Solo asignar si la solicitud no tiene un doctor o si el doctor actual es el autenticado
                    if not instance.doctor: # Si no hay doctor asignado, asigna el autenticado
                        validated_data['doctor'] = doctor_obj_authenticated
                    elif instance.doctor == doctor_obj_authenticated:
                        # Si ya está asignado al mismo doctor, no hacer nada
                        pass
                    else:
                        # Si ya tiene un doctor diferente, y no se envió uno nuevo, mantener el existente
                        pass 
                except Doctor.DoesNotExist:
                    pass # El usuario autenticado no es un doctor, no asignar
            else:
                pass # No hay usuario autenticado, no asignar
        else:
            # Si el doctor_obj_from_data fue proporcionado (ej. un ID),
            # Django REST Framework ya lo habrá convertido en el objeto Doctor si es un PrimaryKeyRelatedField.
            # No necesitamos hacer nada aquí, ya está en validated_data.
            pass

        # Actualizar campos directos de la instancia
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()

        if selected_exams_data is not None:
            instance.selected_exams.set(selected_exams_data)
        
        instance.refresh_from_db()
        return instance


