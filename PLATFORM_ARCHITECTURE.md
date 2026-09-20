# te-takehome — Platform Architecture

One page on how the platform fits together. Per-folder detail lives in each
folder's `README.md`; how to work in a folder lives in its `CLAUDE.md`.

## What this is

A Community Voices platform over **r/steelers**: it ingests what the
community said this week, embeds and tags every voice, and generates a
Community Voices Document — what was talked about, and what will be talked
about next week — with retrieval-augmented generation over pgvector. The
same generator runs without retrieval so the two documents can be compared
side by side.

Built for the Transcendent Endeavors code challenge (Summer 2026). The
reviewer's path is `git clone` → `make dev` → open the app. Nothing on that
path needs an API key, a GPU, or an account. To run a Python service
natively (tests, migrations, a dev server), create the one conda env for the
platform — `make env`, then `conda activate steeler-voices` — see
`environment.yml`.

## The shape

One git repo, laid out as a platform folder: every top-level folder is a
service with its own README, CLAUDE.md, Dockerfile and tests, and could be
split into its own repo without changing a line inside it.

```
browser ── voices-fe (Module Federation host, :5300)
             └─ remote design_system (voices-design-system, :5301)  primitives + tokens
           voices-fe ─REST─▶ voices-be :8300 (Django + DRF)
                                 └─▶ Postgres 16 + pgvector :5445   (the only database)
                                 └─▶ Ollama :11434                 (the only LLM; local)
           voices-de ─REST + X-Internal-API-Key─▶ voices-be         (pipelines never touch the DB)
             └─ reads reddit.com/r/steelers/*.rss, ESPN core API, Ollama
```

| Folder | Layer | Purpose | Stack / port |
| --- | --- | --- | --- |
| `voices-be` | BE | The one writer of the database: voices, embeddings, tags, documents, retrieval events, experiments; the LangGraph generator | Django 5.2 · DRF · Python 3.13 · :8300 |
| `voices-de` | DE | Scheduled pipelines: ingest r/steelers, roster, batch LLM tagging, projection, weekly document runs. POSTs to `voices-be` | Python 3.13 · APScheduler · one-shot CLIs with `--dry-run` |
| `voices-design-system` | DS | Pure Module Federation remote exposing `./theme`: tokens + every primitive the app is composed from | React 19 · TypeScript · Vite · :5301 |
| `voices-fe` | FE | The app: discussion board, the document, the embedding map, the A/B comparison | React 19 · TypeScript · Vite MF host · :5300 |
| `infra` | I | `docker-compose.yml`, the rig, the remote-schedule sketch (EventBridge → Fargate) shown, not applied | Docker Compose |

## Locked decisions

| Decision | Choice | Why |
| --- | --- | --- |
| Community | r/steelers | Active every day of the week; `comments.rss` and `new.rss` are readable with no credentials (JSON is not) |
| Second lens | Fantasy football, via grouping by player | Same voices, different grouping — no second community to ingest |
| Ingest source | Reddit RSS (`RedditRssSource`) polled every 10–15 min with backoff | 429s appear on rapid hits; the cadence catches everything outside game-thread peaks |
| First boot | A committed seed week | The reviewer sees seven days of voices before the scheduler has fired once |
| Embeddings | fastembed `BAAI/bge-small-en-v1.5`, 384-d, ONNX on CPU; pgvector `VectorField` + HNSW cosine | Runs on any laptop; same choice as prior platforms |
| LLM | Ollama, always. No third-party AI anywhere | Data sovereignty; the whole stack runs offline |
| Tagging | Batch, in `voices-de`, not at request time | Accurate (whole-batch context, retries, validation) and cheap; the app reads tags, never computes them |
| Generation | One LangGraph graph with a Postgres checkpointer; the baseline arm is the same graph with retrieval nodes disabled | A/B is one flag; every checkpoint, retrieval and document version lives in our Postgres |
| Experiments | One `experiments` app for generation arms and UI variants | One assignment/outcome model, two uses |
| Projection | PCA / t-SNE from scikit-learn, computed in DE | No UMAP/numba build cost |
| Module Federation | Minimum honest depth: DS remote + one host | Over-engineering counts against us |
| Chart libraries | Live in `voices-fe`, never in the DS remote | CJS transitive deps across the MF boundary break shared-scope init |
| Rig | A rented RunPod GPU running only Ollama (`infra/rig/`); pipelines point `OLLAMA_BASE_URL` at it | This laptop's CPU reads two tokens a second; the rig reads a few thousand voices an hour. Never required for `make dev` |
| Pipelines and the DB | `voices-de` POSTs to `voices-be` internal endpoints | One writer; the DE repo can move anywhere |
| Too much data | Seed = every post + per thread the top 120 comments and anything scoring 5+, longer than a shrug (34,841 of 56,760); readings for the seed computed once on the rig and committed; live ingest reads a two-hour window | The first boot is full in a minute; the tagger only has to keep up with new voices |
| Sources | One `LKSources` row per community; RSS voices are *weak* (create, never overwrite) | The feeds carry no score; the archive is the record |

## Ports

A block nobody else on this machine uses: backend 83xx, frontends 53xx,
Postgres 5445, Ollama on its default 11434.

## Done / open

Done: the data model and internal API (`voices-be`), the design system
through part 03 with parts 04–05 landing, the pipelines, scheduler, seed
and rig (`voices-de`, `infra/`). Open, in order:

1. Tag the seed on the rig; commit `seed/readings.jsonl.gz`
2. `voices-fe`: the board, the flyer, the map, the A/B view, the pipelines view
3. The generator graph (LangGraph, Postgres checkpointer) and the A/B rubric
4. `README.md`, `DEMO.md`, `docs/INSIGHTS.md`, CI workflow
