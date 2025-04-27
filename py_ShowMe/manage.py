import os
import sys
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent

# Load the appropriate .env file based on DJANGO_ENV
env = os.environ.get("DJANGO_ENV", "development")
env_path = BASE_DIR / f".env.{env}"
load_dotenv(dotenv_path=env_path)

def main():
    os.environ.setdefault("DJANGO_ENV", env)
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ShowMe.settings")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError("Couldn't import Django.") from exc
    execute_from_command_line(sys.argv)

if __name__ == "__main__":
    main()
