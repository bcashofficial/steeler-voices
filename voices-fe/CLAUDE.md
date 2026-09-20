# CLAUDE.md — voices-fe

Read `README.md` first (the map) and `../voices-design-system/DESIGN.md`
(the language). This file holds only the rules.

- **Compose, don't draw.** Every visual comes from `design_system/theme`.
  If a screen needs a look the design system lacks, add the primitive
  there (its own workflow), then use it here. No CSS beyond `layout.ts`.
- **Never invent a word.** UI strings are `WORDS`, `SECTIONS`, `GROUPINGS`,
  `MOODS` from the design system's vocab, or data from the API. A missing
  word is a question for Bryan.
- **Reads only.** The app never writes; `api/client.ts` has no POST.
- **Pure logic lives in `.ts` beside its component** (`groupings.ts`,
  `mapRows.ts`, `matchup.ts`) and is unit-tested there; components are
  tested against a mocked `fetch` with the real primitives.
- **Run after every change:** `npm run lint && npm run format:check && npm run typecheck && npm test && npm run build:dev`.
- **Commit messages:** detailed, present tense, no tool attribution.
