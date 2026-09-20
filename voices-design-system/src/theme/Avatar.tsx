/**
 * Avatar — a square with the handle's initial in Anton, on gold, blue,
 * olive or ink chosen by a stable hash of the handle.
 */

import type { CSSProperties } from "react";

import { initialFor, TONE_FILL, TONE_INK, toneFor } from "./avatarTone";
import { typography } from "./tokens";

export interface AvatarProps {
  handle: string;
  size?: number;
  style?: CSSProperties;
}

export function Avatar({ handle, size = 34, style }: AvatarProps) {
  const tone = toneFor(handle);
  return (
    <span
      role="img"
      aria-label={handle}
      data-tone={tone}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.24),
        display: "grid",
        placeItems: "center",
        flex: "none",
        fontFamily: typography.display,
        fontSize: Math.round(size * 0.47),
        lineHeight: 1,
        background: TONE_FILL[tone],
        color: TONE_INK[tone],
        boxShadow: "inset 0 0 0 1px var(--sv-ink)",
        ...style,
      }}
    >
      {initialFor(handle)}
    </span>
  );
}
