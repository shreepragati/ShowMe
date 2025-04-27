"""
WSGI config for ShowMe project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/wsgi/
"""

import os
from django.core.wsgi import get_wsgi_application

# Set settings module for production environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ShowMe.settings.production')

# WSGI application configuration for serving the app in production
application = get_wsgi_application()
