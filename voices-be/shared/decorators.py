"""View decorators: function views, a uniform error envelope, and the
internal-key gate that every pipeline endpoint sits behind."""

import functools
import logging

from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import APIException
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

logger = logging.getLogger(__name__)


def _with_error_envelope(fn):
    @functools.wraps(fn)
    def wrapper(request, *args, **kwargs):
        try:
            return fn(request, *args, **kwargs)
        except APIException:
            raise
        except Exception:
            logger.exception("unhandled error in %s", fn.__name__)
            return Response({"error": "internal error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return wrapper


def voices_api_view(methods):
    """A public endpoint: `@api_view` + AllowAny + the error envelope."""

    def decorator(fn):
        return api_view(methods)(permission_classes([AllowAny])(_with_error_envelope(fn)))

    return decorator


def voices_internal_api_view(methods):
    """A service-to-service endpoint: the public wrapper plus a 401 unless
    the request carries the shared `X-Internal-API-Key`."""

    def decorator(fn):
        @functools.wraps(fn)
        def gated(request, *args, **kwargs):
            if request.headers.get("X-Internal-API-Key", "") != settings.INTERNAL_API_KEY:
                return Response({"error": "invalid internal api key"}, status=status.HTTP_401_UNAUTHORIZED)
            return fn(request, *args, **kwargs)

        return voices_api_view(methods)(gated)

    return decorator
