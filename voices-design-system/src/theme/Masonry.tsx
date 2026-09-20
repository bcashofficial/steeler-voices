/**
 * Masonry — the rail's layout: CSS columns 200px wide with a 12px gutter,
 * each child kept whole (no card breaks across a column) with 14px under
 * it. Below the board's stacking width the columns narrow to 180px so the
 * rail, now full width, still reads as a wall of cards.
 */

import { useEffect, type CSSProperties, type PropsWithChildren } from "react";

import { mountStyle } from "./styles";
import { layout } from "./tokens";

export interface MasonryProps {
  /** Column width in px; the rail's is 200. */
  column?: number;
  className?: string;
  style?: CSSProperties;
}

const STYLE_ID = "sv-masonry";
const CSS = `
.sv-masonry{column-width:var(--sv-masonry-column,${layout.masonryColumn}px);column-gap:12px;min-width:0}
.sv-masonry>*{break-inside:avoid;-webkit-column-break-inside:avoid;margin-bottom:14px}
@media (max-width:${layout.stackBelow}px){.sv-masonry{column-width:var(--sv-masonry-column-narrow,180px)}}
`;

export function Masonry({ column, className, style, children }: PropsWithChildren<MasonryProps>) {
  useEffect(() => mountStyle(STYLE_ID, CSS), []);
  const vars = column
    ? ({
        "--sv-masonry-column": `${column}px`,
        "--sv-masonry-column-narrow": `${column}px`,
      } as CSSProperties)
    : undefined;
  return (
    <div
      className={["sv-masonry", className].filter(Boolean).join(" ")}
      style={{ ...vars, ...style }}
    >
      {children}
    </div>
  );
}
