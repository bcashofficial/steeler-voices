# CLAUDE.md — voices-de

Read `README.md` first; it is the map. This file holds only the rules.

- **No database writes.** Pipelines POST to voices-be internal endpoints.
  A contract change is made on both sides together (the backend's
  serializer and the pipeline's shaping).
- **Entrypoint and service.** `main.py` parses arguments and calls one
  function from `services.py`; the work lives in services so it can move.
  Shared services under `pipelines/shared/services/`.
- **Pure where it can be.** Shaping, validation, math are pure functions
  with tests that never touch a network.
- **The contract** (`runner.py`): env config, `--dry-run`, exit 0/1/2, no
  in-process retries, failure isolation per record, counts reported.
- **One model.** Ollama, through `OllamaClient`, structured output only.
- **Schedules live in the backend's `LKPipelines`** (`lookups/vocab.py`);
  the scheduler reads them. Don't schedule from here.
- After every change: `ruff check .`, `ruff format --check .`, `pytest -q`,
  `docker build .`.
- Commit messages: detailed, present tense, no tool attribution.
