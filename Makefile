# Steeler Voices — local orchestration. `make dev` is the reviewer's command.
#
# Running services natively (tests, migrations, runserver) uses the conda env
# from environment.yml; every native target checks it is active first.
COMPOSE := docker compose -f infra/docker-compose.yml
ENV_NAME := steeler-voices

.PHONY: help dev infra stop env check-env test-be lint-be generate test-de pipeline test-fe lint-fe test-ds lint-ds migrate makemigrations doctor

help:
	@echo "make dev             boot the whole stack in Docker"
	@echo "make infra           Postgres (pgvector) only, for running services natively"
	@echo "make stop            stop everything (volumes are kept)"
	@echo "make env             create the $(ENV_NAME) conda env from environment.yml"
	@echo "make migrate         apply backend migrations (needs: conda activate $(ENV_NAME))"
	@echo "make test-be         run the backend tests against the compose Postgres"
	@echo "make lint-be         ruff check + format --check on the backend"
	@echo "make test-de         run the pipeline tests (no network)"
	@echo "make pipeline P=key ARGS=--dry-run   run one pipeline natively against the running backend"
	@echo "make test-fe         run the app's tests (voices-fe)"
	@echo "make lint-fe         eslint + prettier + tsc on the app"
	@echo "make test-ds         run the design system's tests"
	@echo "make lint-ds         eslint + prettier + tsc on the design system"
	@echo "make generate WEEK=YYYY-MM-DD   write the week's document on both arms, natively"
	@echo "make doctor          check the tools the reviewer's machine needs"

dev: doctor
	@echo "app            http://localhost:5300"
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

# WEEK is the week's Tuesday; OLLAMA_BASE_URL may point at the rig.
generate: check-env infra
	cd voices-be && python manage.py run_generations --week $(WEEK)

test-de: check-env
	cd voices-de && python -m pytest -q

# P is the pipeline key (ingest, embed, tag, ...); OLLAMA_BASE_URL may point at the rig.
pipeline: check-env
	cd voices-de && python -m pipelines.$(P).main $(ARGS)

test-fe:
	cd voices-fe && npm install --no-audit --no-fund --silent && npm test

lint-fe:
	cd voices-fe && npm install --no-audit --no-fund --silent && npm run lint && npm run format:check && npm run typecheck

test-ds:
	cd voices-design-system && npm install --no-audit --no-fund --silent && npm test

lint-ds:
	cd voices-design-system && npm install --no-audit --no-fund --silent && npm run lint && npm run format:check && npm run typecheck

doctor:
	@command -v docker >/dev/null || { echo "docker is required: https://docs.docker.com/get-docker/"; exit 1; }
	@docker compose version >/dev/null 2>&1 || { echo "docker compose v2 is required"; exit 1; }
	@echo "docker ok"

rig-up:
	python3 infra/rig/rig.py up

rig-status:
	python3 infra/rig/rig.py status

rig-down:
	python3 infra/rig/rig.py down
