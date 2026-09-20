/**
 * The two ground layers under and over every page:
 *
 *   leather — pebbled football skin, a 64px tile of irregular bumps drawn
 *             once from a seeded generator, tinted per theme, barely there
 *   grain   — one film of fractal noise over everything, the vintage print
 *
 * Both are fixed, pointer-transparent, mounted once by `VoicesTheme`, and
 * read their opacity and tint from the `--sv-*` variables so a theme
 * switch re-tints them with no re-mount.
 */

export const GROUND_STYLE_ID = "sv-ground";

/** Deterministic pseudo-random so every document draws the same skin. */
function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

export function leatherTile(color: string, seed = 7, pebbles = 26): string {
  const next = seeded(seed);
  const parts: string[] = [];
  for (let i = 0; i < pebbles; i += 1) {
    const cx = (next() * 64).toFixed(1);
    const cy = (next() * 64).toFixed(1);
    const r = 1.4 + next() * 1.2;
    parts.push(`<circle cx='${cx}' cy='${cy}' r='${r.toFixed(1)}' fill='${color}' opacity='0.5'/>`);
    parts.push(
      `<circle cx='${(Number(cx) - 0.5).toFixed(1)}' cy='${(Number(cy) - 0.5).toFixed(1)}' r='${(r * 0.55).toFixed(1)}' fill='${color}' opacity='0.35'/>`,
    );
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'>${parts.join("")}</svg>`;
  return `url("data:image/svg+xml;utf8,${svg.replace(/#/g, "%23")}")`;
}

export const grainFilm =
  `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>` +
  `<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>` +
  `<feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0'/></filter>` +
  `<rect width='160' height='160' filter='url(%23n)'/></svg>")`;

export function buildGroundCss(): string {
  return (
    `body::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:0;` +
    `background-image:var(--sv-leather);background-size:64px 64px;opacity:var(--sv-leather-opacity);}` +
    `body::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:50;` +
    `background-image:${grainFilm};opacity:var(--sv-grain-opacity);mix-blend-mode:var(--sv-grain-blend);}` +
    `body>*{position:relative;z-index:1;}`
  );
}

/** Idempotent — one `<style id="sv-ground">` per document. */
export function mountGround(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(GROUND_STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = GROUND_STYLE_ID;
  el.textContent = buildGroundCss();
  document.head.appendChild(el);
}
