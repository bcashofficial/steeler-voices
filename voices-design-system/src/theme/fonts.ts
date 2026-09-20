/**
 * The two faces, self-hosted (SIL OFL, licences beside the files) and
 * resolved against THIS module's origin so a federated consumer never
 * fetches a font from a path that only exists in its own bundle.
 *
 * `VoicesTheme` mounts the faces once per document.
 */

const ANTON = new URL("./assets/fonts/Anton-Regular.woff2", import.meta.url).href;
const ARCHIVO = new URL("./assets/fonts/Archivo-Variable.woff2", import.meta.url).href;

export const FONT_FACE_STYLE_ID = "sv-font-faces";

export const FONT_FACE_CSS =
  `@font-face{font-family:"Anton";font-style:normal;font-weight:400;font-display:swap;src:url("${ANTON}") format("woff2");}` +
  `@font-face{font-family:"Archivo";font-style:normal;font-weight:400 700;font-display:swap;src:url("${ARCHIVO}") format("woff2");}`;

/** Idempotent — one `<style id="sv-font-faces">` per document. */
export function mountFontFaces(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(FONT_FACE_STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = FONT_FACE_STYLE_ID;
  el.textContent = FONT_FACE_CSS;
  document.head.appendChild(el);
}
