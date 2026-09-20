# CLAUDE.md — voices-design-system

Read `README.md` first (the map) and `DESIGN.md` (the language). This file
holds only the rules.

- **The sheet is the spec.** `docs/board-sheet.html` is what was approved;
  a primitive matches it, then DESIGN.md, then taste — in that order.
- **Never invent a word.** UI strings come from `src/theme/vocab.ts`, which
  mirrors `voices-be/lookups/vocab.py`. A missing word is a question for
  Bryan, not a gap to fill.
- **Nothing looks like a button.** Text + the gold underline, or an icon.
- **No borders for separation.** Spacing and lift.
- **One primitive at a time**, approved before the next. Each lands as a
  plate in the manual (`src/manual/catalog.tsx`), replacing its planned spec.
- **Design-system only.** No consumer changes from here; a needed consumer
  change is one line to Bryan.
- Run after every change: `npm run format && npm run lint && npm run typecheck && npm test && npm run build`.
- Commit messages: detailed, present tense, no tool attribution.
