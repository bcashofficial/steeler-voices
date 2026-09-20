import type { PropsWithChildren } from "react";

import { typography } from "../../theme";
import { MICRO } from "./text";

/** A labelled block inside a plate. */
export function Figure({ label, children }: PropsWithChildren<{ label: string }>) {
  return (
    <section style={{ display: "grid", gap: 10 }}>
      <div style={MICRO}>{label}</div>
      {children}
    </section>
  );
}

export function Swatch({ hex, name, on }: { hex: string; name: string; on?: string }) {
  return (
    <div style={{ display: "grid", gap: 6, minWidth: 96 }}>
      <div
        style={{
          height: 56,
          borderRadius: 8,
          background: hex,
          boxShadow: on ? `inset 0 0 0 1px ${on}` : "inset 0 0 0 1px var(--sv-line)",
        }}
      />
      <div style={{ fontFamily: typography.body, fontSize: 12, fontWeight: 600 }}>{name}</div>
      <div style={{ fontFamily: typography.body, fontSize: 11, color: "var(--sv-ink-3)" }}>
        {hex}
      </div>
    </div>
  );
}
