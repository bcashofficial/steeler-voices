import { useState } from "react";

import {
  LaughSticker,
  MoodMix,
  MoodSwatch,
  MOODS,
  Numeral,
  PulseBar,
  Scoreboard,
  StencilNumber,
  type Reading,
} from "../../theme";
import { Figure } from "./shared";

const SAMPLE_YARDS = [72, 58, 91, 38, 66, 83, 74];

export function PulseBarPlate() {
  return (
    <div style={{ display: "grid", gap: 32 }}>
      <Figure label="lg">
        <PulseBar mood="uneasy" yards={66} size="lg" />
      </Figure>
      <Figure label="md">
        <div style={{ maxWidth: 560 }}>
          <PulseBar mood="proud" yards={91} size="md" />
        </div>
      </Figure>
      <Figure label="sm">
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
    <Figure label="Sizes">
      <div style={{ display: "flex", gap: 24, alignItems: "flex-end" }}>
        <LaughSticker size={26} />
        <LaughSticker size={36} />
        <LaughSticker size={64} />
      </div>
    </Figure>
  );
}

const JPJ = [
  { mood: "heated", share: 0.31 },
  { mood: "frustrated", share: 0.27 },
  { mood: "uneasy", share: 0.22 },
  { mood: "level", share: 0.14 },
  { mood: "hopeful", share: 0.06 },
] as const;
const KHAN = [
  { mood: "frustrated", share: 0.44 },
  { mood: "level", share: 0.3 },
  { mood: "heated", share: 0.16 },
  { mood: "proud", share: 0.1 },
] as const;

export function MoodMixPlate() {
  return (
    <div style={{ display: "grid", gap: 28, maxWidth: 520 }}>
      <Figure label="sm">
        <MoodMix shares={JPJ} label="Joey Porter Jr." />
        <MoodMix shares={KHAN} label="Omar Khan" />
      </Figure>
      <Figure label="md">
        <MoodMix shares={JPJ} size="md" label="Joey Porter Jr." />
      </Figure>
    </div>
  );
}

export function MoodSwatchPlate() {
  return (
    <Figure label="In a row">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {MOODS.map((mood) => (
          <MoodSwatch key={mood.key} mood={mood.key} on={mood.key === "uneasy"} />
        ))}
      </div>
    </Figure>
  );
}

const READINGS: Reading[] = [
  { mood: "uneasy", yards: 66, who: "u/Stealth_Well_worn" },
  { mood: "uneasy", yards: 54, who: "u/swampthingsden" },
  { mood: "frustrated", yards: 78, who: "u/liquidgrill", sarcasm: true },
  { mood: "level", yards: 38, who: "u/ecg_tsp" },
  { mood: "heated", yards: 91, who: "u/Passw0rd-Is-Tac0" },
];

export function ScoreboardPlate() {
  const [current, setCurrent] = useState<Reading | null>(null);
  return (
    <div style={{ display: "grid", gap: 28 }}>
      <Scoreboard resting={READINGS[0]} current={current} />
      <Figure label="Hover a reading">
        <div style={{ display: "grid", gap: 4 }} onMouseLeave={() => setCurrent(null)}>
          {READINGS.slice(1).map((reading) => (
            <div
              key={reading.who}
              tabIndex={0}
              onMouseEnter={() => setCurrent(reading)}
              onFocus={() => setCurrent(reading)}
              style={{ padding: "8px 10px", borderRadius: 8, maxWidth: 520, cursor: "default" }}
            >
              <PulseBar
                mood={reading.mood}
                yards={reading.yards}
                sarcasm={reading.sarcasm}
                label={reading.who}
                animate={false}
              />
            </div>
          ))}
        </div>
      </Figure>
    </div>
  );
}

export function NumeralPlate() {
  return (
    <div style={{ display: "grid", gap: 28 }}>
      <Figure label="Digits">
        <StencilNumber value={1234567890} height={50} offset={4} />
      </Figure>
      <Figure label="Sizes">
        <div style={{ display: "flex", gap: 32, alignItems: "flex-end", flexWrap: "wrap" }}>
          <Numeral value={601} size="sm" />
          <Numeral value={601} size="md" />
          <Numeral value={601} size="lg" />
        </div>
      </Figure>
      <Figure label="With captions">
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
          <Numeral value={61} size="md" caption="Posts" roll />
          <Numeral value={4212} size="md" caption="Comments" roll />
          <Numeral value={7} size="md" caption="Subjects" roll />
        </div>
      </Figure>
    </div>
  );
}
