import type { CSSProperties } from "react";

import { typography } from "../../theme";

export const MICRO: CSSProperties = {
  fontFamily: typography.body,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--sv-ink-2)",
};

export const BODY: CSSProperties = {
  fontFamily: typography.body,
  fontSize: 14,
  lineHeight: 1.5,
  color: "var(--sv-ink)",
  maxWidth: "62ch",
  margin: 0,
};

export const MUTED: CSSProperties = { ...BODY, color: "var(--sv-ink-2)" };
