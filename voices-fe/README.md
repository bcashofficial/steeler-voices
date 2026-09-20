# voices-fe

The Steeler Voices app: the board, the document, the map, the A/B and the
pipelines, for any week the store holds. A Module Federation **host** that
composes every screen from the `design_system` remote and reads `voices-be`.
Layer: frontend. React 19 · TypeScript · Vite · port **5300**.

Platform map: `../PLATFORM_ARCHITECTURE.md`.

## Talks to

| Service | Direction | Protocol | For what |
|---|---|---|---|
| voices-design-system | in | Module Federation (`design_system/theme` from `:5301/assets/remoteEntry.js`) | every primitive, token and word |
| voices-be | out | REST, `GET /api/...` (`VITE_BACKEND_URL`, default `http://localhost:8300`) | the weeks, the rail, a thread, the map, the documents, the pipelines |

Nothing is written from here; the app only reads.

## Screens (the sections, from the vocab)

| section | shows | reads |
|---|---|---|
| Board | the flyer over the board on first visit; the thread pane with the scoreboard and every voice; the readings pane grouped by subject, topic or mood; the rail of the week's posts | `/api/weeks/<date>/`, `/posts/`, `/api/threads/<id>/` |
| Document | the week's Community Voices Document on the retrieval arm | `/api/weeks/<date>/documents/` |
| Map | the flattened embeddings by mood, the topics, the most-retrieved voices | `/api/weeks/<date>/map/` |
| A/B | both arms of the same week side by side with their runs and outcomes | `/api/weeks/<date>/documents/` |
| Pipelines | every pipeline, its schedules, its last run's counts | `/api/pipelines/` |

The section rides the URL hash (`#map`); the week is chosen in the masthead.

## Layout

```
src/
  main.tsx                 mounts VoicesTheme (from the remote) and the App
  App.tsx                  the masthead (week, section, theme) and the section on screen
  useSection.ts            the section from the hash
  layout.ts                the app's few layout rules (the 75/25 split, the pane group)
  format.ts                times as "Thu 1:16 PM", handles as u/name, cover heights
  text.ts · Display.tsx    the body face's settings; a heading in the display face
  api/                     types.ts (the API's shapes), client.ts (the paths), useRead.ts
  board/                   Board, ThreadPane, ReadingsPane, Rail; groupings.ts (pure)
  sections/                DocumentSection, AbSection, MapSection (+ Scatter, mapRows.ts),
                           PipelinesSection, WeekFlyer (+ matchup.ts)
```

`design_system/theme` is typed straight from the design system's source
(`tsconfig.json` paths) and, in tests, resolved to it (`vitest.config.ts`),
so tests render the real primitives against a mocked backend.

## Run / test / lint

```bash
make dev                      # from the repo root — the whole stack; the app on :5300
npm install
npm run dev                   # Vite on :5300 (the remote must be built and served on :5301)
npm run build:dev             # the flavour the container serves
npm test                      # vitest
npm run lint && npm run format:check && npm run typecheck
```

## Rules

- **Nothing is drawn here that the design system could draw.** A new
  look is a primitive in `voices-design-system`, then a use here.
- **No words of its own.** Every string is a word from the design system's
  `vocab.ts` or data from the API.
- **Reads only.** The pipelines write; the app shows.
