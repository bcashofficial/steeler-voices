/**
 * DoubleRule — the flyer's rule: a 3px ink line with a 1px line 5px
 * beneath it, the program's printed rule. Six pixels tall, full width.
 */

import type { CSSProperties } from "react";

export interface DoubleRuleProps {
  className?: string;
  style?: CSSProperties;
}

export function DoubleRule({ className, style }: DoubleRuleProps) {
  return (
    <div
      role="separator"
      className={className}
      style={{
        height: 6,
        width: "100%",
        background:
          "linear-gradient(var(--sv-ink) 0 3px, transparent 3px 5px, var(--sv-ink) 5px 6px)",
        ...style,
      }}
    />
  );
}
