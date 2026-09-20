"""Settings for voices-be. Everything comes from the environment; the committed
`.env.development` is loaded only when no `.env` overrides it, so a fresh
checkout boots and a misconfigured deploy fails loudly."""

import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")
load_dotenv(BASE_DIR / ".env.development")

SERVICE_NAME = "voices-be"

SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]
DEBUG = os.environ.get("DJANGO_DEBUG", "false").lower() == "true"
ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS", "*").split(",")
INTERNAL_API_KEY = os.environ["INTERNAL_API_KEY"]

OLLAMA_BASE_URL = os.environ["OLLAMA_BASE_URL"]
OLLAMA_TAGGING_MODEL = os.environ["OLLAMA_TAGGING_MODEL"]
OLLAMA_GENERATION_MODEL = os.environ["OLLAMA_GENERATION_MODEL"]

# Steeler Nation's week turns on Tuesday; every week boundary is computed here.
COMMUNITY_TIME_ZONE = "America/New_York"

INSTALLED_APPS = [
    "django.contrib.contenttypes",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "shared",
    "lookups",
    "voices",
    "documents",
    "experiments",
    "pipelines",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.common.CommonMiddleware",
]

ROOT_URLCONF = "steeler_voices.urls"
WSGI_APPLICATION = "steeler_voices.wsgi.application"
ASGI_APPLICATION = "steeler_voices.asgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ["DB_NAME"],
        "USER": os.environ["DB_USER"],
        "PASSWORD": os.environ["DB_PASSWORD"],
        "HOST": os.environ["DB_HOST"],
        "PORT": os.environ.get("DB_PORT", "5432"),
    }
}

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = False
USE_TZ = True

STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

CORS_ALLOW_ALL_ORIGINS = True  # a local demo; the frontends run on other ports

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_PAGINATION_CLASS": "shared.pagination.DefaultPagination",
    "PAGE_SIZE": 50,
    "UNAUTHENTICATED_USER": None,
}
