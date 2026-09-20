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
path needs an API key, a GPU, or an account.

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
| Rig | Optional remote GPU box running the same compose; the Mac tunnels ports | Makes Ollama fast for development and demos; never required |
| Pipelines and the DB | `voices-de` POSTs to `voices-be` internal endpoints | One writer; the DE repo can move anywhere |

## Ports

A block nobody else on this machine uses: backend 83xx, frontends 53xx,
Postgres 5445, Ollama on its default 11434.

## Open (decided together, in order)

1. Vocabulary and data model
2. Design system: look, feel, and every component
3. Screens of `voices-fe`
4. Pipeline cadence and the batch-tagging taxonomy
5. The generator graph and the A/B rubric
