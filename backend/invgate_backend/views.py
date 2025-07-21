# C:\invgate_project\backend\invgate_backend\views.py

from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny
from rest_framework.authentication import SessionAuthentication
from django.utils import timezone # ¡Importa timezone!

from .serializers import UserSerializer

class CustomAuthTokenView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            if not user.is_active:
                return Response(
                    {'non_field_errors': ['La cuenta de usuario está inactiva.']},
                    status=status.HTTP_400_BAD_REQUEST
                )

            token, created = Token.objects.get_or_create(user=user)

            # --- AÑADE ESTE CÓDIGO PARA ACTUALIZAR last_login_at ---
            if hasattr(user, 'userprofile'): # Asegúrate de que el usuario tenga un UserProfile
                user.userprofile.last_login_at = timezone.now()
                user.userprofile.save()
            # Si decides usar el campo 'last_login' incorporado de Django (que ya existe en User):
            # user.last_login = timezone.now() # Esto actualizará el campo last_login del modelo User
            # user.save(update_fields=['last_login']) # Guarda solo ese campo
            # Te recomiendo usar last_login del User model si es solo para el login.
            # Si quieres el tuyo para otros propósitos, úsalo.
            # Mantendremos user.userprofile.last_login_at por ahora, ya que lo tienes.
            # --- FIN CÓDIGO AÑADIDO ---


            user_data = UserSerializer(user).data

            return Response({
                'token': token.key,
                'user_id': user_data.get('id'),
                'username_field': user_data.get('username'),
                'email': user_data.get('email'),
                'is_staff': user_data.get('is_staff', False),
                'user_profile': user_data.get('user_profile', None)
            })
        else:
            return Response(
                {'non_field_errors': ['Usuario o contraseña incorrectos.']},
                status=status.HTTP_400_BAD_REQUEST
            )