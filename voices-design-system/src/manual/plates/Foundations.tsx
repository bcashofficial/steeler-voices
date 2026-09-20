import {
  GROUPINGS,
  MOODS,
  motion,
  palette,
  SECTIONS,
  themes,
  typography,
  WORDS,
} from "../../theme";
import { Figure, Swatch } from "./shared";
import { BODY, MICRO, MUTED } from "./text";

export function PalettePlate() {
  return (
    <div style={{ display: "grid", gap: 28 }}>
      <Figure label="The five">
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Swatch hex={palette.ink} name="ink" />
          <Swatch hex={palette.gold} name="gold" />
          <Swatch hex={palette.mist} name="mist" />
          <Swatch hex={palette.blue} name="blue" />
          <Swatch hex={palette.olive} name="olive" />
          <Swatch hex={palette.white} name="white" />
        </div>
      </Figure>
      <Figure label="Two grounds">
        <p style={BODY}>
          Light is pure white with the ink for text and mist as a tint. Dark is the ink for the
          ground, {themes.dark.surface} for a lifted surface, mist for text. Ink hierarchy on either
          ground is three alpha steps of the ink; lines are two.
        </p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Swatch hex={themes.light.ground} name="light ground" />
          <Swatch hex={themes.dark.ground} name="dark ground" />
          <Swatch hex={themes.dark.surface} name="dark surface" />
        </div>
      </Figure>
      <Figure label="Gold is the accent">
        <p style={MUTED}>
          The display offset, the underline, the chip. Blue and olive are component alternates,
          never the accent.
        </p>
      </Figure>
    </div>
  );
}

export function TypographyPlate() {
  const { scale } = typography;
  return (
    <div style={{ display: "grid", gap: 28 }}>
      <Figure label="Anton — display, one weight, the gold offset">
        <div
          style={{
            fontFamily: typography.display,
            fontSize: scale.masthead.fontSize,
            lineHeight: scale.masthead.lineHeight,
            textShadow: `${typography.displayOffset} ${palette.gold}`,
          }}
        >
          Steeler Voices
        </div>
        <div style={{ display: "flex", gap: 24, alignItems: "baseline", flexWrap: "wrap" }}>
          {(["numeral", "numeralMd", "numeralSm"] as const).map((step) => (
            <span
              key={step}
              style={{
                fontFamily: typography.display,
                fontSize: scale[step].fontSize,
                lineHeight: scale[step].lineHeight,
                textShadow: `${typography.displayOffsetSmall} ${palette.gold}`,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              601
            </span>
          ))}
        </div>
      </Figure>
      <Figure label="Archivo — everything else">
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ fontFamily: typography.body, ...scale.title }}>
            Title 15 / 600 — Joey Porter Jr leaves steelers practice
          </div>
          <div style={{ fontFamily: typography.body, ...scale.body }}>
            Body 14 / 1.45 — Genuinely frustrating to see some of the contracts we have handed out
            but won’t pay him.
          </div>
          <div style={{ fontFamily: typography.body, ...scale.small, color: "var(--sv-ink-2)" }}>
            Small 12 / 500 — u/swampthingsden · Thu 1:19 PM
          </div>
          <div style={MICRO}>Micro 11 / 600 / 0.1em — Posts</div>
        </div>
      </Figure>
      <Figure label="Rules">
        <p style={MUTED}>
          Regular punctuation and case. Numbers over words: where a count can stand in for a
          sentence, it does, in Anton. Digits are tabular wherever they line up.
        </p>
      </Figure>
    </div>
  );
}

export function GroundsPlate() {
  return (
    <div style={{ display: "grid", gap: 28 }}>
      <Figure label="Leather">
        <p style={BODY}>
          A 64px tile of irregular pebbles from a seeded generator, tinted in the theme's ink, at{" "}
          {themes.light.leatherOpacity * 100}% on white and {themes.dark.leatherOpacity * 100}% on
          the ink. It is under this page.
        </p>
        <div
          style={{
            height: 120,
            borderRadius: 12,
            background: "var(--sv-leather)",
            backgroundSize: "64px 64px",
            opacity: 0.5,
          }}
        />
      </Figure>
      <Figure label="Grain">
        <p style={BODY}>
          One film of fractal noise over everything — multiplied on white, screened on the ink. The
          vintage print. It is over this page.
        </p>
      </Figure>
    </div>
  );
}

export function MotionPlate() {
  return (
    <Figure label="Three durations">
      <table style={{ ...BODY, borderCollapse: "collapse" }}>
        <tbody>
          {Object.entries(motion).map(([name, value]) => (
            <tr key={name}>
              <td style={{ padding: "6px 24px 6px 0", fontWeight: 600 }}>{name}</td>
              <td style={{ padding: "6px 0", color: "var(--sv-ink-2)" }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={MUTED}>
        The underline draws in, a container lifts, a number rolls. Everything else holds still;
        under reduced motion, everything does.
      </p>
    </Figure>
  );
}

export function WordsPlate() {
  return (
    <div style={{ display: "grid", gap: 28 }}>
      <Figure label="Moods">
        <p style={BODY}>{MOODS.map((m) => m.label).join(" · ")}</p>
      </Figure>
      <Figure label="Groupings">
        <p style={BODY}>{GROUPINGS.map((g) => g.label).join(" · ")}</p>
      </Figure>
      <Figure label="Sections">
        <p style={BODY}>{SECTIONS.map((s) => s.label).join(" · ")}</p>
      </Figure>
      <Figure label="Labels">
        <p style={BODY}>{Object.values(WORDS).join(" · ")}</p>
      </Figure>
      <p style={MUTED}>
        Mirrored from voices-be lookups/vocab.py. Neither file has a word the other doesn't.
      </p>
    </div>
  );
}
