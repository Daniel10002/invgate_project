# backend/invgate_backend/urls.py
from django.contrib import admin
from django.urls import path, include

# Importaciones para servir archivos estáticos en desarrollo
from django.conf import settings # Necesario para settings.DEBUG
from django.conf.urls.static import static # No lo usaremos directamente para STATIC_ROOT, pero puede ser útil para MEDIA_ROOT
from django.contrib.staticfiles.urls import staticfiles_urlpatterns # <-- Esta es la clave

from .views import CustomAuthTokenView # Asegúrate de que esta vista existe y es correcta

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Agrupamos todas las rutas de API bajo un mismo prefijo 'api/'
    path('api/', include([ 
        path('auth/', CustomAuthTokenView.as_view()), 
        path('', include('profiles.urls')), 
        path('', include('assets.urls')), 
        path('', include('medical.urls')), 
    ])),
]

# CAMBIO CLAVE: Servir archivos estáticos en modo desarrollo
if settings.DEBUG:
    # ELIMINA ESTA LÍNEA: urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += staticfiles_urlpatterns() # <-- Esta línea es la única necesaria para estáticos en DEBUG=True

