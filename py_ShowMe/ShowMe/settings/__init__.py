import os

DJANGO_ENV = os.environ.get("DJANGO_ENV", "development")

if DJANGO_ENV == "production":
    from .production import *
elif DJANGO_ENV == "development":
    from .development import *
else:
    raise Exception(f"Unknown DJANGO_ENV: {DJANGO_ENV}")