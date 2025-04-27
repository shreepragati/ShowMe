from pathlib import Path
from dotenv import load_dotenv
import os
from .base import *
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent.parent 

# Load environment variables from .env.production
load_dotenv(dotenv_path=BASE_DIR / '.env.production')

DJANGO_ENV = os.getenv("DJANGO_ENV", "production")
print("DJANGO_ENV =", DJANGO_ENV)

# ✅ CORS CONFIG
CORS_ALLOW_ALL_ORIGINS = False  # Restrict access to specific origins
CORS_ALLOW_CREDENTIALS = True  # Enable cookies with CORS requests

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Frontend URL
    "http://127.0.0.1:5173",  # In case you're testing with a different address
]

# In case of any CSRF issues, set trusted origins
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


# ✅ INSTALLED APPS
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',

    # Auth
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',

    # REST Auth
    'dj_rest_auth',
    'dj_rest_auth.registration',

    # REST & JWT
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_simplejwt',

    # Cross-origin
    'corsheaders',

    # Your apps
    'userProfile',
    'posts',
    'profileview',
    'search',
    'follows',
    'chat',
    'notifications',

    # Search
    'django_elasticsearch_dsl',

    # Channels
    'channels',
    'storages'
]

# ✅ MIDDLEWARE
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Ensure this is at the top
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
]

# ✅ DATABASE (Production PostgreSQL Setup)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'ShowMe'),
        'USER': os.getenv('DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'root123'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# ✅ PASSWORD VALIDATORS
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]
ROOT_URLCONF = 'ShowMe.urls'


# ✅ I18N & TIMEZONE
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

# ✅ STATIC/MEDIA CONFIG
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# # ✅ SECURITY HEADERS
# SECURE_BROWSER_XSS_FILTER = True
# SECURE_CONTENT_TYPE_NOSNIFF = True
# SECURE_HSTS_SECONDS = 31536000  # 1 year
# SECURE_HSTS_INCLUDE_SUBDOMAINS = True
# SECURE_HSTS_PRELOAD = True
# SESSION_COOKIE_SECURE = True  # Make sure to set True in production
# CSRF_COOKIE_SECURE = True     # Make sure to set True in production
#   # Enforce HTTPS redirection in production

# # Disable SSL redirect in local environments


ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "").split(",")

# ✅ JWT CONFIG
REST_USE_JWT = True
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
}

# ✅ SITE ID
SITE_ID = 1

# ✅ GOOGLE SOCIAL LOGIN
SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'APP': {
            'client_id': os.getenv('SOCIAL_AUTH_GOOGLE_CLIENT_ID'),
            'secret': os.getenv('SOCIAL_AUTH_GOOGLE_SECRET'),
            'key': ''
        },
        'SCOPE': ['profile', 'email'],
        'AUTH_PARAMS': {'access_type': 'online'},
    }
}

# ✅ ELASTICSEARCH
ELASTICSEARCH_DSL = {
    'default': {
        'hosts': os.getenv("ELASTICSEARCH_HOST", "http://localhost:9200")
    },
}

# ✅ CHANNELS LAYERS (Using Redis in Production)
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [(os.getenv("REDIS_HOST", "localhost"), 6379)],
        },
    },
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ✅ AWS S3 STORAGE (For media files)
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'

AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME','showme-media')
AWS_S3_REGION_NAME = os.getenv('AWS_S3_REGION_NAME','ap-south-1')  # Example: 'us-west-2'
AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.{AWS_S3_REGION_NAME}.amazonaws.com'

MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/'

AWS_DEFAULT_ACL = None
AWS_S3_URL_PROTOCOL = 'https'
AWS_S3_USE_SSL = True
AWS_S3_VERIFY = True

STORAGES = {
    "default": {
        "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
        "OPTIONS": {
            "bucket_name": AWS_STORAGE_BUCKET_NAME,
            "region_name": AWS_S3_REGION_NAME,
        },
    },
    "staticfiles": {  # Store static files locally
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}

print(f"DEFAULT_FILE_STORAGE: {DEFAULT_FILE_STORAGE}")
print(f"AWS_STORAGE_BUCKET_NAME: {AWS_STORAGE_BUCKET_NAME}")
print(f"AWS_S3_REGION_NAME: {AWS_S3_REGION_NAME}")
print(f"AWS_S3_CUSTOM_DOMAIN: {AWS_S3_CUSTOM_DOMAIN}")
print(f"MEDIA_URL: {MEDIA_URL}")

# ✅ LOGGING
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'level': 'DEBUG',  # Set the level to DEBUG to see all your messages
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'userProfile.views': {  # Use the exact name of your app and views module
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': True,
        },
        'root': {  # Add this 'root' logger
            'handlers': ['console'],
            'level': 'WARNING',  # Or any level higher than DEBUG
        }
    },
}

print("ALLOWED_HOSTS =", ALLOWED_HOSTS)
print("CORS_ALLOWED_ORIGINS =", CORS_ALLOWED_ORIGINS)
