import { LaughSticker, MOODS, PulseBar } from "../../theme";
import { Figure } from "./shared";
import { BODY, MUTED } from "./text";

const SAMPLE_YARDS = [72, 58, 91, 38, 66, 83, 74];

export function PulseBarPlate() {
  return (
    <div style={{ display: "grid", gap: 32 }}>
      <Figure label="lg — the scoreboard's field">
        <PulseBar mood="uneasy" yards={66} size="lg" />
      </Figure>
      <Figure label="md">
        <div style={{ maxWidth: 560 }}>
          <PulseBar mood="proud" yards={91} size="md" />
        </div>
      </Figure>
      <Figure label="sm — a thread row, every mood">
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
      </Figure>
      <Figure label="How it plays">
        <p style={BODY}>
          On mount the ticks rise left to right, fourteen milliseconds apart. The head tick breathes
          on the yard line. Move the cursor across a field and the ticks rise under it. The chip
          rolls to its yardage. Under reduced motion it simply is.
        </p>
      </Figure>
    </div>
  );
}

export function LaughStickerPlate() {
  return (
    <div style={{ display: "grid", gap: 28 }}>
      <Figure label="Three sizes">
        <div style={{ display: "flex", gap: 24, alignItems: "flex-end" }}>
          <LaughSticker size={26} />
          <LaughSticker size={36} />
          <LaughSticker size={64} />
        </div>
      </Figure>
      <p style={MUTED}>
        Sarcasm is a flag, not a mood. The sticker sits at the end of a pulse row; it never replaces
        the reading.
      </p>
    </div>
  );
}
