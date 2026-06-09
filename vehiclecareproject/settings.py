from pathlib import Path
import os
# pyrefly: ignore [missing-import]
import dj_database_url
from dotenv import load_dotenv

load_dotenv()  # loads variables from .env into os.environ

BASE_DIR = Path(__file__).resolve().parent.parent

# ==============================
# 🔐 SECURITY SETTINGS
# ==============================

SECRET_KEY = os.environ.get("SECRET_KEY", "django-insecure-dev-key-change-in-production")

# Default to False in production; override locally via .env: DEBUG=True
DEBUG = os.environ.get("DEBUG", "False") == "True"

# Localhost for dev; Vercel domains + custom domain for production
_allowed = os.environ.get("ALLOWED_HOSTS", "")
ALLOWED_HOSTS = _allowed.split(",") if _allowed else [
    "localhost",
    "127.0.0.1",
    ".vercel.app",
    ".onvercel.app",
]

# ==============================
# 🔒 PRODUCTION SECURITY HEADERS
# ==============================

# Only enforce HTTPS headers when not in DEBUG mode
if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_HSTS_SECONDS = 31536000          # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

X_FRAME_OPTIONS = "DENY"

# ==============================
# 📦 INSTALLED APPS
# ==============================

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'vehiclecareapp',
]

# ==============================
# ⚙️ MIDDLEWARE
# ==============================

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Serve static files in production
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'vehiclecareproject.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'vehiclecareproject.wsgi.application'

# ==============================
# 🗄 DATABASE CONFIGURATION
# ==============================

# Default: SQLite for local development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Production: use DATABASE_URL env var (set in Vercel dashboard)
# e.g. postgres://user:pass@host/dbname  (Neon, Supabase, etc.)
DATABASE_URL = os.environ.get("DATABASE_URL")
if DATABASE_URL:
    DATABASES['default'] = dj_database_url.parse(
        DATABASE_URL,
        conn_max_age=600,       # keep connections alive for 10 mins
        conn_health_checks=True,
    )

# ==============================
# 🔑 PASSWORD VALIDATION
# ==============================

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ==============================
# 🌍 INTERNATIONALIZATION
# ==============================

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ==============================
# 📂 STATIC FILES
# ==============================

STATIC_URL = '/static/'

STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

# Where `collectstatic` copies files (served by WhiteNoise in production)
STATIC_ROOT = BASE_DIR / 'staticfiles'

# WhiteNoise: compress and cache static files with long-lived headers
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# ==============================
# 📁 MEDIA FILES
# ==============================

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# ==============================
# 📧 EMAIL CONFIGURATION
# ==============================

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True

EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD")

# ==============================
# 🔐 DEFAULT AUTO FIELD
# ==============================

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'