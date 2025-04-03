import os

environment = os.environ.get('DJANGO_ENV', 'development')  

try:
    if environment == 'production':
        from .production import *
    else:
        from .development import *
except ImportError:
    from .development import * #