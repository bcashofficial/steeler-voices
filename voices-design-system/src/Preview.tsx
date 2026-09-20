import { MOODS, palette, PulseBar, typography, useVoicesTheme, VoicesTheme } from "./theme";

/**
 * Standalone preview rendered when the design system's own URL is opened.
 * A smoke test of the theme layers and each primitive as it lands. The
 * engineering playground (every primitive + variant) lives in voices-fe at
 * `/playground`.
 */
export function Preview() {
  return (
    <VoicesTheme>
      <PreviewBody />
    </VoicesTheme>
  );
}

const SAMPLE_YARDS = [72, 58, 91, 38, 66, 83, 74];

function PreviewBody() {
  const { mode, toggle } = useVoicesTheme();
  return (
    <main
      style={{ padding: "24px 16px", maxWidth: 720, margin: "0 auto", display: "grid", gap: 28 }}
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

      <PulseBar mood="uneasy" yards={66} size="lg" />

      <div style={{ display: "grid", gap: 22, maxWidth: 520 }}>
        {MOODS.map((mood, index) => (
          <PulseBar
            key={mood.key}
            mood={mood.key}
            yards={SAMPLE_YARDS[index]}
            sarcasm={mood.key === "frustrated"}
          />
        ))}
      </div>
    </main>
  );
}
