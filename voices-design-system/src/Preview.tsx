import { MOODS, palette, typography, useVoicesTheme, VoicesTheme } from "./theme";

/**
 * Standalone preview rendered when the design system's own URL is opened.
 * A smoke test of the theme layers — fonts, variables, grounds, the mode
 * switch. The engineering playground (every primitive + variant) lives in
 * voices-fe at `/playground`.
 */
export function Preview() {
  return (
    <VoicesTheme>
      <PreviewBody />
    </VoicesTheme>
  );
}

function PreviewBody() {
  const { mode, toggle } = useVoicesTheme();
  return (
    <main
      style={{ padding: "24px 16px", maxWidth: 720, margin: "0 auto", display: "grid", gap: 20 }}
    >
      <h1
        style={{
          fontFamily: typography.display,
          fontWeight: 400,
          fontSize: typography.scale.masthead.fontSize,
          lineHeight: typography.scale.masthead.lineHeight,
          margin: 0,
          textShadow: `${typography.displayOffset} ${palette.gold}`,
        }}
      >
        Steeler Voices
      </h1>
      <button
        type="button"
        onClick={toggle}
        style={{
          background: "none",
          border: 0,
          padding: 0,
          color: "var(--sv-ink-2)",
          font: "500 13px Archivo, sans-serif",
          cursor: "pointer",
          justifySelf: "start",
          textDecoration: "underline",
          textDecorationColor: palette.gold,
          textDecorationThickness: 3,
        }}
      >
        {mode === "dark" ? "Switch to light" : "Switch to dark"}
      </button>
      <div style={{ display: "grid", gap: 8 }}>
        {MOODS.map((mood) => (
          <div
            key={mood.key}
            style={{
              display: "grid",
              gridTemplateColumns: "90px 1fr",
              gap: 12,
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 12, color: "var(--sv-ink-2)" }}>{mood.label}</span>
            <span
              style={{
                height: 10,
                borderRadius: 999,
                background: `linear-gradient(90deg, ${mood.from}, ${mood.to})`,
              }}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
