# voices-be

The Steeler Voices backend: the only writer of the database, the read API
for the app, and the home of the document generator. Django 5.2 · DRF ·
Python 3.13 · Postgres 16 + pgvector · port **8300**.

Platform map: `../PLATFORM_ARCHITECTURE.md`.

## Apps

| app | owns |
|---|---|
| `lookups/` | every `LK` vocabulary; `vocab.py` holds the words, `seed_lookups` writes them |
| `voices/` | `Voice`, `Author`, `Week`, `Game`, `Embedding` (pgvector), `Reading`, `Topic`; `weeks.py` is the one place a Tuesday-to-Monday week is computed |
| `documents/` | `GenerationRun`, `Document`, `Section`, `Citation`, `RetrievalEvent`; the generator (`graph.py`) |
| `experiments/` | `Experiment`, `Variant`, `Assignment`, `Outcome` — generation arms and UI variants alike |
| `pipelines/` | `PipelineRun` — every voices-de run, reported by the pipeline itself |
| `shared/` | base models, `voices_api_view` / `voices_internal_api_view`, pagination |

## Conventions

Function views behind `@voices_api_view`; a fat `services.py` per app;
serializers validate input and shape output; manual `urls.py`; UUID primary
keys named `<table>_id`; `TimeStampedModel` / `SoftDeleteModel` /
`LookupModel` from `shared/models.py`; factory_boy factories under each
app's `tests/`; ruff for lint and format.

Pipelines never write the database directly — they POST to
`/api/internal/...` endpoints gated by `X-Internal-API-Key`.

## The generator

One LangGraph graph writes the week's Community Voices Document on both
arms, checkpointing every step in this Postgres (`langgraph-checkpoint-postgres`):

```
brief → plan → retrieve → write → store → judge
             └──────────────────┘   the baseline skips retrieval
```

- `brief.py` — the week's facts: dates, the team and its game for every arm;
  the loudest threads and most-read subjects (the retrieval arm's queries).
- `retrieval.py` — each query embedded with the pipelines' model
  (fastembed bge-small), the week's nearest voices by cosine over pgvector's
  HNSW index; every hit is a `RetrievalEvent` and a count on its embedding.
- `prompts.py` · `llm.py` — the writer's and the judge's briefs; Ollama with a
  JSON schema at temperature zero (`OLLAMA_GENERATION_MODEL`).
- `graph.py` — the nodes; `store` writes the document, its sections (from
  `LKSectionKinds`) and a citation per cited voice, and publishes it.
- `scoring.py` · `experiments.py` — the A/B: `groundedness` (claims backed
  by a citation), `specificity` (claims naming the week's own people and
  threads), `judge_score` (the model judging each claim against the same
  sample of the week's top voices, 1–5); each run is assigned to its arm's
  variant and its outcomes recorded.
- `generator.py` — runs a pending run to the end and writes success or
  failure on it; `manage.py run_generations [--week DATE] [--watch]` is the
  process (compose runs it as `voices-generator`; the DE `generate`
  pipeline only requests runs).

## What the app reads

Public, unauthenticated, read-only; each app's `reads.py` does the work.

| endpoint | for |
|---|---|
| `GET /api/status/` | how full the store is |
| `GET /api/vocab/` | the words |
| `GET /api/weeks/` | every week with voices, newest first, with its counts and games |
| `GET /api/weeks/<YYYY-MM-DD>/` | the flyer: the week, its counts, its top subjects |
| `GET /api/weeks/<YYYY-MM-DD>/posts/` | the rail: the week's posts with each thread's mood mix |
| `GET /api/threads/<voice_id>/` | one thread in reading order, each voice with its newest reading and topic |
| `GET /api/weeks/<YYYY-MM-DD>/map/` | the projected embeddings, the week's topics, the most-retrieved voices |
| `GET /api/weeks/<YYYY-MM-DD>/documents/` | one row per arm: the published document (else the newest), its run, its outcomes |
| `GET /api/pipelines/` | every pipeline with its schedules and last run |

## Run

```bash
make dev                      # from the repo root — everything in Docker
```

Natively, from the repo root (one conda env serves every Python service):

```bash
make env                      # once: conda env create -f environment.yml
conda activate steeler-voices
make infra                    # Postgres only, then in this folder:
python manage.py migrate && python manage.py seed_lookups
python manage.py runserver 8300
```

Env is read from `.env` (if present) then the committed `.env.development`.
Every variable is required; a missing one fails at import.

## Test

```bash
make test-be && make lint-be  # or, with steeler-voices active, in this folder:
python -m pytest -q
ruff check . && ruff format --check .
```

Tests run against the compose Postgres so vector columns are real.
