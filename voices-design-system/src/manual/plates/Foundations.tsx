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
import { BODY, MICRO } from "./text";

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
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Swatch hex={themes.light.ground} name="light ground" />
          <Swatch hex={themes.dark.ground} name="dark ground" />
          <Swatch hex={themes.dark.surface} name="dark surface" />
        </div>
      </Figure>
    </div>
  );
}

export function TypographyPlate() {
  const { scale } = typography;
  return (
    <div style={{ display: "grid", gap: 28 }}>
      <Figure label="Anton">
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
      <Figure label="Helvetica Neue">
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ fontFamily: typography.body, ...scale.title }}>Title 15 / 600</div>
          <div style={{ fontFamily: typography.body, ...scale.body }}>Body 14 / 1.45</div>
          <div style={{ fontFamily: typography.body, ...scale.small, color: "var(--sv-ink-2)" }}>
            Small 12 / 500
          </div>
          <div style={MICRO}>Micro 11 / 600 / 0.1em</div>
        </div>
      </Figure>
    </div>
  );
}

export function GroundsPlate() {
  return (
    <div style={{ display: "grid", gap: 28 }}>
      <Figure label="Leather">
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
    </div>
  );
}

export function MotionPlate() {
  return (
    <Figure label="Durations">
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
    </div>
  );
}
