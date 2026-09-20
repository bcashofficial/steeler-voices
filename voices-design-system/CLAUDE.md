# CLAUDE.md — voices-design-system

Read `README.md` first (the map) and `DESIGN.md` (the language). This file
holds the rules and the workflow.

## Rules

- **The sheet is the spec.** `docs/board-sheet.html` is what was approved;
  a primitive matches it, then DESIGN.md, then taste — in that order. Open
  the sheet in a browser; it has real data and the interactions.
- **Never invent a word.** UI strings come from `src/theme/vocab.ts`, which
  mirrors `voices-be/lookups/vocab.py`. A missing word is a question for
  Bryan, not a gap to fill. No explanatory copy anywhere — a plate is its
  heading and its figures; a figure label is one or two words.
- **Nothing looks like a button.** Text + the gold underline, or an icon.
- **No borders for separation.** Spacing and lift (`--sv-shadow-lift`).
- **Numbers are drawn.** Every count is `StencilNumber` / `Numeral`, never
  a font. Anton is for words (masthead, titles); Helvetica Neue for the rest.
- **Tokens only.** Colors, faces, spacing, motion from `tokens.ts`; theme
  values through the `--sv-*` variables so both grounds work. Mood colors
  through `--sv-mood-<key>-from/to` (per theme in `tokens.moodStops`).
- **No scrim blur.** A backdrop blur over the fixed grain layer mirrors the
  page in Chrome. Scrims are 62% ink, flat.
- **One primitive at a time**, approved before the next.
- **Design-system only.** No consumer changes from here.
- **Commit messages:** detailed, present tense, no tool attribution of any kind.

## Workflow for a primitive

1. Read its planned plate in `src/manual/catalog.tsx` (what + props) and
   find it on `docs/board-sheet.html`.
2. Write `src/theme/<Name>.tsx`. Component files export only components
   (fast-refresh rule); pure helpers go in a sibling `.ts`. Styles that need
   hover/keyframes: a CSS string mounted once with `mountStyle(id, css)`;
   otherwise inline style objects. Respect `prefers-reduced-motion`.
3. Export from `src/theme/index.ts` (the one MF barrel).
4. Tests in `src/theme/<Name>.test.tsx` (Testing Library, jsdom; wrap in
   `<VoicesTheme mode="light">`).
5. A plate: add `<Name>Plate` to the right `src/manual/plates/*.tsx` and flip
   the catalog entry from `planned(...)` to `{ key, label, status: "built",
   Component }`. Figures use `Figure` from `plates/shared.tsx`, real data
   from the sheet (handles, comments, counts), no captions.
6. `npm run format && npm run lint && npm run typecheck && npm test && npm run build` — all clean.
7. From the repo root: `docker compose -f infra/docker-compose.yml up -d --build design-system`,
   then **hard-refresh** http://localhost:5301/#<plate-key> (the browser
   caches the old bundle; add `?v=N` if it still shows stale).
8. Commit.

Reference patterns: `PulseBar.tsx` (mounted CSS, hover, replay, meter
semantics), `Scoreboard.tsx` (controlled, composes primitives),
`MoodSwatch.tsx` (theme-resolved colors, `inkFor`), `StencilNumber.tsx`.

## Working in parallel

Two sessions build different parts at once. To keep merges trivial:

- Take a whole part (03 The board, 04 The rail, 05 Chrome and the flyer);
  say which in the first commit.
- Each part's plates live in their own file: `plates/BoardPlates.tsx`,
  `plates/RailPlates.tsx`, `plates/ChromePlates.tsx`. Don't edit another
  part's plate file.
- Shared files you will both touch: `src/theme/index.ts` (append only, at
  the end) and `src/manual/catalog.tsx` (edit only your part's entries).
  Commit small and often; `git pull --rebase` before each commit.
- Don't change `tokens.ts`, `vocab.ts`, `DESIGN.md` or an existing
  primitive's props without saying so — those are shared contracts.
