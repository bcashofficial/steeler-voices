# CLAUDE.md — voices-be

Read `README.md` first; it is the map. This file holds only the rules.

- **Backend only.** No frontend, design-system, or copy changes from here.
- **Never invent words.** Labels, headings, mood names, section names are
  chosen by Bryan and live in `lookups/vocab.py`; an empty list there is a
  decision not yet made, not a gap to fill.
- **Every week boundary comes from `voices/weeks.py`.** No other date math.
- **Function views + `@voices_api_view`; services do the work.** Views
  validate with a serializer, call one service function, return its result.
- **Internal endpoints are `@voices_internal_api_view`** and live under
  `/api/internal/`. They are the only way rows are written.
- **Run after every change:** `ruff check .`, `ruff format --check .`,
  `pytest -q`. Green or it doesn't ship.
- **Commit messages:** detailed, present tense, no tool attribution.
