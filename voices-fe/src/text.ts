/** The body face's few settings, from the type scale. */

import type { CSSProperties } from "react";

import { typography } from "design_system/theme";

const { body, small, micro, title } = typography.scale;

export const BODY: CSSProperties = {
  fontFamily: typography.body,
  fontSize: body.fontSize,
  lineHeight: body.lineHeight,
  fontWeight: body.fontWeight,
  color: "var(--sv-ink)",
  margin: 0,
};

export const TITLE: CSSProperties = {
  ...BODY,
  fontSize: title.fontSize,
  fontWeight: title.fontWeight,
};

export const SMALL: CSSProperties = {
  ...BODY,
  fontSize: small.fontSize,
  lineHeight: small.lineHeight,
  fontWeight: small.fontWeight,
  color: "var(--sv-ink-2)",
};

export const MICRO: CSSProperties = {
  fontFamily: typography.body,
  fontSize: micro.fontSize,
  fontWeight: micro.fontWeight,
  letterSpacing: micro.letterSpacing,
  textTransform: "uppercase",
  color: "var(--sv-ink-2)",
};

export const TABULAR: CSSProperties = {
  ...SMALL,
  fontVariantNumeric: "tabular-nums",
  color: "var(--sv-ink-3)",
};
