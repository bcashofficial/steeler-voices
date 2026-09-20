# Steeler Voices — local orchestration. `make dev` is the reviewer's command.
#
# Running services natively (tests, migrations, runserver) uses the conda env
# from environment.yml; every native target checks it is active first.
COMPOSE := docker compose -f infra/docker-compose.yml
ENV_NAME := steeler-voices

.PHONY: help dev infra stop env check-env test-be lint-be migrate makemigrations doctor

help:
	@echo "make dev             boot the whole stack in Docker"
	@echo "make infra           Postgres (pgvector) only, for running services natively"
	@echo "make stop            stop everything (volumes are kept)"
	@echo "make env             create the $(ENV_NAME) conda env from environment.yml"
	@echo "make migrate         apply backend migrations (needs: conda activate $(ENV_NAME))"
	@echo "make test-be         run the backend tests against the compose Postgres"
	@echo "make lint-be         ruff check + format --check on the backend"
	@echo "make doctor          check the tools the reviewer's machine needs"

dev: doctor
	@echo "design system  http://localhost:5301"
	@echo "backend        http://localhost:8300/health/"
	@echo "pipelines      docker compose -f infra/docker-compose.yml logs -f voices-de"
	$(COMPOSE) up --build

infra:
	$(COMPOSE) up -d postgres

stop:
	$(COMPOSE) down

env:
	@command -v conda >/dev/null || { echo "conda is required: https://docs.conda.io/en/latest/miniconda.html"; exit 1; }
	conda env create -f environment.yml
	@echo "now: conda activate $(ENV_NAME)"

check-env:
	@[ "$$CONDA_DEFAULT_ENV" = "$(ENV_NAME)" ] || { \
		echo "activate the conda env first:  conda activate $(ENV_NAME)"; \
		echo "(no env yet?  make env)"; exit 1; }

makemigrations: check-env infra
	cd voices-be && python manage.py makemigrations

migrate: check-env infra
	cd voices-be && python manage.py migrate

test-be: check-env infra
	cd voices-be && python -m pytest -q

lint-be: check-env
	cd voices-be && ruff check . && ruff format --check .

doctor:
	@command -v docker >/dev/null || { echo "docker is required: https://docs.docker.com/get-docker/"; exit 1; }
	@docker compose version >/dev/null 2>&1 || { echo "docker compose v2 is required"; exit 1; }
	@echo "docker ok"
