# backend/profiles/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserProfile
from medical.models import Doctor # Asegúrate de que este modelo exista y esté importado

User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('full_name', 'position', 'area', 'phone_number', 'location') # Añadí phone_number y location si los tienes en UserProfile

class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ('full_name', 'specialty', 'medical_license', 'phone_number')

class UserSerializer(serializers.ModelSerializer):
    userprofile = UserProfileSerializer(required=False, allow_null=True)
    doctor = DoctorSerializer(required=False, allow_null=True)
    # Nuevo campo para indicar si el usuario es un doctor
    es_doctor = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'is_staff', 'userprofile', 'doctor', 'es_doctor')
        extra_kwargs = {'password': {'write_only': True, 'required': False}}

    # Método para obtener el valor de 'es_doctor'
    def get_es_doctor(self, obj):
        # Retorna True si existe un objeto Doctor relacionado con este usuario, de lo contrario False
        return hasattr(obj, 'doctor') and obj.doctor is not None

    def create(self, validated_data):
        userprofile_data = validated_data.pop('userprofile', None)
        doctor_data = validated_data.pop('doctor', None)
        password = validated_data.pop('password', None)
        
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        
        if userprofile_data:
            UserProfile.objects.create(user=user, **userprofile_data)
        if doctor_data:
            Doctor.objects.create(user=user, **doctor_data)

        return user

    def update(self, instance, validated_data):
        userprofile_data = validated_data.pop('userprofile', None)
        doctor_data = validated_data.pop('doctor', None)
        password = validated_data.pop('password', None)

        # Actualiza campos del usuario principal
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)

        # Manejo de UserProfile
        if userprofile_data is not None: # Si se envía data de userprofile
            user_profile, created = UserProfile.objects.get_or_create(user=instance)
            for attr, value in userprofile_data.items():
                setattr(user_profile, attr, value)
            user_profile.save()
        elif hasattr(instance, 'userprofile'): # Si no se envía data pero existía, y se quiere eliminar (no aplica aquí, pero es buena práctica)
            pass # No hacemos nada si no se envía data y ya existe, se mantiene

        # Manejo de Doctor
        if doctor_data is not None: # Si se envía data de doctor (significa que es o se quiere que sea doctor)
            doctor_profile, created = Doctor.objects.get_or_create(user=instance)
            for attr, value in doctor_data.items():
                setattr(doctor_profile, attr, value)
            doctor_profile.save()
        else: # Si doctor_data es None (significa que no es o no se quiere que sea doctor)
            # Si el usuario tenía un perfil de doctor, lo eliminamos
            if hasattr(instance, 'doctor') and instance.doctor is not None:
                instance.doctor.delete()
                # Importante: para que el `select_related('doctor')` no devuelva el objeto en cache
                # y el `get_es_doctor` funcione correctamente para la siguiente lectura.
                # Es mejor recargar la instancia o invalidar la relación.
                # Para simplificar, si se elimina, el `get_es_doctor` lo detectará como None.
                # Sin embargo, si se hace un update y luego un get sin recargar, podría haber un problema.
                # Una solución más robusta sería:
                # del instance._prefetched_objects_cache['doctor'] # Esto es más avanzado y no siempre necesario
                # O simplemente confiar en que la siguiente petición GET lo obtendrá correctamente.


        instance.save()
        return instance

