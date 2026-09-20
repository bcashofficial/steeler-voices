# Setup

Everything runs locally, on one machine, with no keys. This is the long form
of the README's "Run it"; if `make dev` already worked for you, you can stop
reading.

## 1. What you need

| tool | why | check |
|---|---|---|
| Docker Desktop (Compose v2) | runs Postgres, the backend, the pipelines, the design system, the app, the generator | `docker compose version` |
| Ollama (recommended) | the model, on the host — a container can't use a Mac's GPU | `ollama --version` |
| conda (optional) | only to run the Python tests and pipelines natively | `conda --version` |
| Node 22 (optional) | only to run the design system or the app natively | `node --version` |

Ports used: **5300** app · **5301** design system · **8300** API · **5445** Postgres · **11434** Ollama. Nothing else on the machine should hold them.

## 2. The model

On a Mac, install [Ollama](https://ollama.com) and pull the two models once:

```bash
ollama pull qwen3:8b            # writes and judges the document
ollama pull qwen3:4b-instruct   # tags every voice: mood, intensity, target, subjects
```

No Ollama? Set `COMPOSE_PROFILES=bundled-ollama` (see step 3) and compose runs it in a container, CPU only. It works; it is slow — a document takes tens of minutes instead of a few.

## 3. Environment

There is one optional file at the root and one committed file per service.

```bash
cp .env.example .env      # optional — every line in it is optional
```

`.env` (root, git-ignored — `make dev` passes it to compose when it exists):

| variable | default | when to set it |
|---|---|---|
| `OLLAMA_BASE_URL` | `http://host.docker.internal:11434` (the host's Ollama) | pointing the stack at a remote Ollama, e.g. the rig |
| `COMPOSE_PROFILES` | — | `bundled-ollama` to run Ollama in a container |
| `RUNPOD_API_KEY` | — | only for the optional GPU rig (`infra/rig/`) |

`<service>/.env.development` (committed; dev values, nothing secret; compose overrides the hostnames it must):

| service | variables |
|---|---|
| `voices-be` | `DJANGO_SECRET_KEY` `DJANGO_DEBUG` `DB_HOST` `DB_PORT` `DB_NAME` `DB_USER` `DB_PASSWORD` `INTERNAL_API_KEY` `OLLAMA_BASE_URL` `OLLAMA_TAGGING_MODEL` `OLLAMA_GENERATION_MODEL` |
| `voices-de` | `BACKEND_URL` `INTERNAL_API_KEY` `OLLAMA_BASE_URL` `OLLAMA_TAGGING_MODEL` `OLLAMA_GENERATION_MODEL` `EMBEDDING_MODEL` `SUBREDDIT` `SOURCE_LABEL` `ESPN_TEAM` `PIPELINE_HOST` `LOG_LEVEL` |
| `voices-fe` | build args `VITE_BACKEND_URL` (`http://localhost:8300`) and `DESIGN_SYSTEM_URL` (`http://localhost:5301`) — the browser's view of the other two, baked at build |

`INTERNAL_API_KEY` must match between `voices-be` and `voices-de`; it does.

## 4. Run

```bash
make dev
```

Compose builds six images and starts them. Watch for these lines:

```
voices-be-1    ... Listening at: http://0.0.0.0:8300
voices-de-1    ... load_seed done {'new': 34841, ...}      # first boot only, about a minute
voices-fe-1    ➜  Local: http://localhost:5300/
```

Then open **http://localhost:5300**. The flyer opens over the board; "Open the board" closes it and the football brings it back.

What fills in over the first hour, on the pipelines' schedules (the **Pipelines** section shows each one's last run):

| pipeline | when | what you see |
|---|---|---|
| `load_seed` | boot, once | 34,841 voices — the board is full |
| `embed` | every 15 min | vectors for every voice (needed by retrieval and the map) |
| `tag` | hourly | pulses on voices, mood mixes on rows and cards, the scoreboard |
| `project` | hourly | the **Map** |
| `cluster` | hourly | topics on the map and "By topic" on the board |
| `ingest`, `ingest_rss` | every 10 / 15 min | new posts and comments from r/steelers |
| `generate` | Tuesday 06:00 | the week's document, both arms |

To see the document now instead of Tuesday:

```bash
make generate WEEK=2026-09-15     # both arms; a few minutes on a GPU, longer on a CPU
```

(`WEEK` is a Tuesday; the app's week picker lists the weeks in the store.) Then open the **Document** and **A/B** sections.

## 5. Verify

```bash
curl http://localhost:8300/api/status/      # counts of voices, embeddings, readings, topics, documents
make test-ds && make test-fe                # 51 + 14 tests (npm installs once)
make env && conda activate steeler-voices   # then:
make test-be && make test-de                # 51 + 16 tests, against the compose Postgres
```

## 6. Stop, reset

```bash
make stop                                              # containers down, data kept
docker compose -f infra/docker-compose.yml down -v     # data gone; next boot reloads the seed
```

## 7. If something's off

- **A port is taken** — `lsof -nP -iTCP:5300 -sTCP:LISTEN` (and 5301, 8300, 5445); stop the other process or change the port in `infra/docker-compose.yml`.
- **The backend exits after migrations** — the Postgres volume is from a broken run; `docker compose -f infra/docker-compose.yml down -v` and `make dev` again.
- **No pulses, no scoreboard, empty "By subject"** — the tagger hasn't reached that thread yet; it reads oldest-first on its hourly schedule. `make pipeline P=tag` runs it now (needs the conda env).
- **The Map is empty** — `project` runs hourly; `make pipeline P=project` runs it now.
- **A document run failed** — the run's error shows in the A/B section under the arm. The usual cause is Ollama unreachable from Docker: on Linux `host.docker.internal` needs Docker 20.10+ (compose adds the host mapping); or set `OLLAMA_BASE_URL` in `.env`.
- **Everything is slow** — the embedder and the tagger are CPU-bound; a rented GPU (`infra/rig/README.md`) runs the same pipelines at speed and is never required.

## 8. The optional rig

`infra/rig/` rents a GPU running only Ollama (RunPod, one API key). `make rig-up`, then `OLLAMA_BASE_URL=$(python infra/rig/rig.py url)` in `.env`, then `make dev` or `make generate`. `make rig-down` when done.
