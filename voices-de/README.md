# voices-de

Steeler Voices' data engineering: the pipelines that fill the store, and
the scheduler that fires them while `make dev` is up. Layer: data
engineering. Python 3.13 · requests · numpy · fastembed · APScheduler.

Pipelines never touch the database. Every write goes to `voices-be`'s
`/api/internal/` endpoints behind `X-Internal-API-Key`; the backend is the
only writer and this repo could move anywhere.

## Talks to

| Service | Direction | For what |
|---|---|---|
| voices-be (`BACKEND_URL`) | out | runs, voices, embeddings, projections, readings, topics, games, generation requests; reads status, vocab, pending work, vectors |
| Arctic Shift archive | in | posts and comments of the subreddit (no credentials, ~30 s behind live) |
| reddit.com RSS | in | the newest 25 posts / 100 comments straight from the community's site |
| ESPN site API | in | the season schedule and results |
| Ollama (`OLLAMA_BASE_URL`) | out | the batch tagger and topic naming — the only model, local |

## Pipelines

Each is a folder with `main.py` (the entrypoint: parse args, call one
service, exit) and `services.py` (the work), plus `tests/` that run
without a network.

| key | what it does | local | remote |
|---|---|---|---|
| `load_seed` | the committed capture into an empty store, once | boot | manual |
| `ingest` | posts and comments from the archive, a two-hour window ending now (`--since YYYY-MM-DD` for history) | every 10 min | `rate(10 minutes)` |
| `ingest_rss` | the same voices from reddit.com's feeds, weak (never overwrite) | every 15 min | `rate(15 minutes)` |
| `schedule` | games and results from ESPN, placed in Tuesday weeks | daily 06:00 | `cron(0 10 * * ? *)` |
| `embed` | a 384-d vector for every voice without one (fastembed bge-small, CPU) | every 15 min | `rate(15 minutes)` |
| `tag` | batch readings from Ollama: mood, intensity, target, sarcasm, gist, subjects | hourly | `rate(1 hour)` |
| `project` | every vector onto 2-D with PCA, whole corpus, one frame | hourly | `rate(1 hour)` |
| `cluster` | a week's topics by spherical k-means, named by Ollama | hourly | `rate(1 hour)` |
| `generate` | request the week's document on both arms | Tue 06:00 | `cron(0 10 ? * TUE *)` |

The schedules live in the backend's `LKPipelines` table (one place); the
scheduler reads them at boot and the app shows them.

The contract: config from env (a missing setting exits 2), `--dry-run`
fetches and maps but writes nothing, exit 0 on success and 1 on failure,
no in-process retries (the next firing is the retry), a bad record is
logged and counted and the run continues, every run reports its counts.

## Shared services (`pipelines/shared/services/`)

`config.py` (env → `Settings`), `backend.py` (`BackendClient`, the one door
to voices-be), `runner.py` (the contract), `reddit.py` (archive and RSS rows
→ the voices contract, pure), `ollama.py` (structured-output chat).

## The seed

`seed/collect.py` captured six Tuesday weeks (Aug 11 → Sep 21, 2026) of
r/steelers into `seed/raw/` (ignored). `python -m seed.build_seed` curates
it into `seed/voices.jsonl.gz` (committed): every usable post, and per
thread the top 120 comments by score plus anything scoring 5 or more,
longer than a shrug — 34,841 voices in 3.5 MB. `seed/readings.jsonl.gz`
carries readings computed ahead of time, keyed by external id, so the
first boot has moods without a tagging backlog. `load_seed` POSTs both.

## Run / test

```bash
make dev                                  # from the repo root: the scheduler runs in Docker
make pipeline P=ingest ARGS=--dry-run     # one pipeline, natively, against the running backend
make test-de
```

Natively: `python -m venv .venv && .venv/bin/pip install -r requirements.txt`,
then `.venv/bin/python -m pipelines.<key>.main [--dry-run]`.

## Remote

`deploy/` sketches the same pipelines as one-shot ECS Fargate tasks on
EventBridge schedules (the `remote` column above). It is shown, not applied.
