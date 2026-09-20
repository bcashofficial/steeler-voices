# voices-de — the pipelines and the local scheduler.
# One image, one entrypoint per pipeline (`python -m pipelines.<key>.main`);
# the default command is the scheduler that fires them while `make dev` is up.
FROM python:3.13-slim
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 FASTEMBED_CACHE_PATH=/models
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN useradd --create-home --uid 10001 pipeline && mkdir -p /models && chown -R pipeline /app /models
USER pipeline
CMD ["python", "scheduler.py"]
