import { LaughSticker, MOODS, PulseBar } from "../../theme";
import { Figure } from "./shared";

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
    </div>
  );
}
