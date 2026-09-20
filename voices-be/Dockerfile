# voices-be — Django + DRF, the only writer of the database.
# Two stages: wheels built with the toolchain, a slim runtime without one.
FROM python:3.13-slim AS builder
WORKDIR /app
RUN pip install --no-cache-dir --upgrade pip
COPY requirements.txt .
RUN pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt

FROM python:3.13-slim AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1
WORKDIR /app
COPY --from=builder /wheels /wheels
COPY requirements.txt .
RUN pip install --no-cache-dir --no-index --find-links=/wheels -r requirements.txt \
    && rm -rf /wheels
COPY . .
RUN useradd --create-home --uid 10001 appuser && chown -R appuser /app
USER appuser
EXPOSE 8300
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD curl -fsS http://localhost:8300/health/ || exit 1
CMD ["gunicorn", "steeler_voices.wsgi:application", "--bind", "0.0.0.0:8300", "--workers", "2", "--timeout", "120"]
