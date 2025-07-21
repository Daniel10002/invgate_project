# backend/invgate_backend/settings.py
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-m+g*68y1y^26d6n2n)8*1!f%#e@w+t1p_z5+j^w=^5r#_5j^d('

DEBUG = True

# CAMBIO CLAVE: Permite la IP de tu máquina local si no es localhost
# Si estás en desarrollo, puedes usar ['*'] para permitir todo, pero NO en producción.
# Si conoces la IP de tu máquina React (ej. 172.24.2.193), añádela aquí.
ALLOWED_HOSTS = ['172.24.2.193', 'localhost', '127.0.0.1'] # <-- AÑADE TU IP Y CUALQUIER OTRO HOSTNAME/IP DESDE DONDE ACCEDAS

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Mis apps
    'rest_framework',
    'corsheaders', # Asegúrate de que esté aquí
    'assets',
    'profiles',
    'medical',
    'django_filters',
    'rest_framework.authtoken',
    'simple_history',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware', # ¡MUY IMPORTANTE: DEBE ESTAR LO MÁS ARRIBA POSIBLE!
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'invgate_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        # Si no tienes plantillas HTML globales en 'backend/templates/',
        # puedes dejar DIRS vacío o eliminar esta línea si estaba solo para el PDF.
        # Si tienes otras plantillas HTML globales, MANTÉN esta línea.
        'DIRS': [], # <-- Puedes dejarlo vacío si no tienes plantillas globales
        'APP_DIRS': True, # Esto le dice a Django que busque en 'templates/' dentro de cada app
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'invgate_backend.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'invgate_db',
        'USER': 'postgres',
        'PASSWORD': 'Ingreso123', # ¡Asegúrate de poner tu contraseña aquí!
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
LANGUAGE_CODE = 'es-cl'
TIME_ZONE = 'America/Santiago'
USE_I10N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CAMBIO CLAVE AQUÍ: Permitir el origen de tu frontend
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://172.24.2.193:3000", # <-- ¡AÑADE LA IP Y EL PUERTO DE TU FRONTEND!
    # Si usas "redsalud" en el archivo hosts, también podrías añadirlo si tu frontend lo usa directamente
    # "http://redsalud:3000",
]

# Si quieres permitir TODOS los orígenes en desarrollo (menos seguro, solo para depuración)
# CORS_ALLOW_ALL_ORIGINS = True # <-- Descomenta esta línea y comenta CORS_ALLOWED_ORIGINS para permitir todo temporalmente

REST_FRAMEWORK = {
    'DEFAULT_FILTER_BACKENDS': ['rest_framework.filters.SearchFilter'],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ]
}

# CAMBIO CLAVE: Asegurarse de que Django encuentre los archivos estáticos de las aplicaciones
STATICFILES_FINDERS = [
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder', # Crucial para los estáticos de las apps (como el admin)
]
