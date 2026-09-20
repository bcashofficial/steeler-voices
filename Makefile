# Steeler Voices — local orchestration. `make dev` is the reviewer's command.
COMPOSE := docker compose -f infra/docker-compose.yml

.PHONY: help dev infra stop test-be migrate makemigrations doctor

help:
	@echo "make dev        boot the whole stack in Docker"
	@echo "make infra      Postgres (pgvector) only, for running services natively"
	@echo "make stop       stop everything (volumes are kept)"
	@echo "make test-be    run the backend tests against the compose Postgres"
	@echo "make doctor     check the tools the reviewer's machine needs"

dev: doctor
	$(COMPOSE) up --build

infra:
	$(COMPOSE) up -d postgres

stop:
	$(COMPOSE) down

makemigrations: infra
	cd voices-be && .venv/bin/python manage.py makemigrations

migrate: infra
	cd voices-be && .venv/bin/python manage.py migrate

test-be: infra
	cd voices-be && .venv/bin/python -m pytest -q

doctor:
	@command -v docker >/dev/null || { echo "docker is required: https://docs.docker.com/get-docker/"; exit 1; }
	@docker compose version >/dev/null 2>&1 || { echo "docker compose v2 is required"; exit 1; }
	@echo "docker ok"
