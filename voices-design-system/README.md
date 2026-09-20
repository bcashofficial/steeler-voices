# voices-design-system

Steeler Voices' design system: every design token and shared primitive,
shipped as a pure Module Federation remote (`design_system`) that
`voices-fe` loads at runtime. Layer: design system.

Standalone: yes (a static bundle; calls no backend). Port **5301**.

## Talks to

| Service | Direction | Protocol | For what |
|---|---|---|---|
| voices-fe | in | Module Federation (`design_system/theme` from `remoteEntry.js`) | the app and its `/playground` |

## Stack

TypeScript + React 19, Vite 6, `@originjs/vite-plugin-federation`; `react`
and `react-dom` are the only shared singletons. Vitest + Testing Library on
jsdom. ESLint + Prettier.

## Layout

```
src/
  main.tsx · Preview.tsx      standalone smoke preview on this remote's own URL
  test-setup.ts               jest-dom matchers, an in-memory localStorage
  theme/
    index.ts                  THE barrel — the one surface MF exposes
    tokens.ts                 palette, both themes, type, spacing, radius, motion, layout
    vocab.ts                  the words (moods, groupings, sections) — mirrors voices-be lookups/vocab.py
    fonts.ts                  Anton + Archivo, self-hosted, resolved MF-safely
    ground.ts                 the leather tile and the grain film
    cssVariables.ts           the tokens as --sv-* variables, one block per theme
    VoicesTheme.tsx           the provider: mounts fonts, variables, grounds once; owns light/dark
    VoicesThemeContext.ts     useVoicesTheme()
    assets/fonts/             the two woff2 files and their OFL licences
docs/board-sheet.html · docs/type-sheet.html   the approved sheets DESIGN.md was written from
DESIGN.md                     the design language
```

## Run / test / lint

```bash
npm install
npm run dev            # Vite on :5301
npm run build          # tsc + production build -> dist/assets/remoteEntry.js
npm run build:dev      # the build `make dev` serves with vite preview
npm test               # vitest
npm run lint && npm run format:check && npm run typecheck
```

## Rules for changing this repo

- One barrel. Adding a primitive is adding an export to `src/theme/index.ts`;
  never a `remotes` block.
- Every barrel export gets a section in `voices-fe/src/pages/Playground/` in
  the same change.
- Consumers import primitives; never copy a render, keyframe or class into
  a consumer. If a consumer needs a case, add a prop or variant here.
- Colors, faces, spacing come from `tokens.ts`; words from `vocab.ts`. No
  literals in a primitive.
- No heavyweight runtime deps (charts, editors); this remote stays ESM-only.
- After every change: `npm run format`, `npm run lint`, `npm run typecheck`,
  `npm test`, `npm run build` — all clean.
