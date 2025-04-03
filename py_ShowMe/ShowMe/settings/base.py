import os
from dotenv import load_dotenv, find_dotenv
import dj_database_url

environment = os.environ.get('DJANGO_ENV', 'development')
env_file = f".env.{environment}"
load_dotenv(find_dotenv(filename=env_file))

SECRET_KEY = os.environ.get('SECRET_KEY')
DEBUG = os.environ.get('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

DATABASES = {
    'default': dj_database_url.config(default=os.environ.get('DATABASE_URL'))
}