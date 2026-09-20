# How this was built

The challenge's optional step asks for the `/insights` report and anything
unusual about the coding workflow. The report is below; first, the parts
of the workflow that shaped the code.

## The look came first, as a spec

Before a primitive was written, the whole board was designed as one HTML
sheet with real data and real interactions (`voices-design-system/docs/board-sheet.html`)
and approved. `DESIGN.md` was written *from* the sheet — the language, the
metaphor, every token — and the design system was then built one primitive
at a time, each matched to the sheet, each landing as a plate in a manual
that is the system's own URL. Twenty-eight plates, 51 tests. The app
composes those primitives and draws nothing of its own.

## Words are data

Every string a person reads comes from one vocabulary (`voices-be/lookups/vocab.py`,
mirrored in `voices-design-system/src/theme/vocab.ts`): the moods, the
groupings, the sections, the pipelines' descriptions, the document's
section kinds and the question the generator answers for each. A missing
word is a decision to make, not a gap to fill, so nothing on screen was
invented by a model mid-task — the backend seeds the words into lookup
tables and the app shows them.

## Services with one writer

One repo, five folders, each a service that could be split out without
changing a line: the backend is the only process that writes the
database; the pipelines POST to its internal API; the app only reads; the
design system is a Module Federation remote the app loads at runtime.
That shape is what let two AI sessions build in parallel in one working
tree — each owning a part, appending to shared barrels, committing only
its own paths — with the rules written into each folder's `CLAUDE.md`
rather than remembered.

## Module Federation for a design system

The design system ships as a pure remote (`design_system/theme`), the app
as a pure host. Adding a primitive is adding an export and a plate; the
app imports it over the wire, typed straight from the remote's source in
development. One consumer today; the same remote serves the next one
without a copy.

## AI-native by construction

The generator is one LangGraph graph with a Postgres checkpointer, both
arms of the A/B on the same graph with retrieval as a conditional edge.
The model, the embedder and the checkpointer are injected, so the whole
graph runs under test with fakes and in production against Ollama — the
same code path. Every retrieval is a row; every run is assigned and
scored; a run that fails writes its failure on itself. The tagging that
gives the board its moods is a batch pipeline, not a request-time call,
so the app never waits on a model.

## Everything runs offline

Ollama for every model call, fastembed on the CPU for vectors, pgvector
in the one Postgres, a committed seed so the first boot is full. No keys.
A rented GPU (`infra/rig/`) makes the same pipelines fast when there is a
season to read, and is never required.

## The `/insights` report

Run `/insights` in the Claude Code session that built this and paste the
report here.
