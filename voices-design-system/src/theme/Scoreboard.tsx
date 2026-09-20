/**
 * Scoreboard — the legend that plays back whichever voice you're on.
 *
 * Yardage in Anton with the gold offset over `yards`, the mood word and the
 * handle, a large pulse field with the yard lines marked beneath, and the
 * seven swatches. It is controlled: the thread passes the reading under
 * the cursor as `current`, and `resting` when nothing is; every change of
 * reading replays the field and rolls the digits.
 */

import { useRef, type CSSProperties } from "react";

import { MoodSwatch } from "./MoodSwatch";
import { PulseBar } from "./PulseBar";
import { StencilNumber } from "./StencilNumber";
import { typography } from "./tokens";
import { useRollingNumber } from "./useRollingNumber";
import { MOODS, moodByKey, WORDS, type MoodKey } from "./vocab";

export interface Reading {
  mood: MoodKey;
  yards: number;
  who: string;
  sarcasm?: boolean;
}

export interface ScoreboardProps {
  resting: Reading;
  current?: Reading | null;
  style?: CSSProperties;
}

const MARKS = ["G", "10", "20", "30", "40", "50", "40", "30", "20", "10", "G"];

export function Scoreboard({ resting, current, style }: ScoreboardProps) {
  const reading = current ?? resting;
  const plays = useRef(0);
  const last = useRef<Reading>(reading);
  if (last.current !== reading) {
    last.current = reading;
    plays.current += 1;
  }
  const replayKey = plays.current;
  const yards = useRollingNumber(Math.round(reading.yards), 420, replayKey);

  return (
    <section
      aria-live="polite"
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: "6px 16px",
        alignItems: "end",
        ...style,
      }}
    >
      <div style={{ display: "grid", gap: 4 }}>
        <StencilNumber value={yards} height={50} offset={4} style={{ minWidth: 84 }} />
        <span
          style={{
            fontFamily: typography.body,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--sv-ink-3)",
          }}
        >
          {WORDS.yards}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          fontFamily: typography.body,
          fontSize: 12,
          color: "var(--sv-ink-2)",
        }}
      >
        <b
          data-mood={reading.mood}
          style={{ color: "var(--sv-ink)", fontWeight: 600, fontSize: 14 }}
        >
          {moodByKey[reading.mood].label}
        </b>
        <span>{reading.who}</span>
      </div>
      <div style={{ gridColumn: 2, display: "grid", gap: 4 }}>
        <PulseBar
          mood={reading.mood}
          yards={reading.yards}
          sarcasm={reading.sarcasm}
          size="lg"
          replayKey={replayKey}
          head={false}
        />
        <div
          aria-hidden="true"
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: typography.display,
            fontSize: 11,
            letterSpacing: "0.04em",
            color: "var(--sv-ink-3)",
            padding: "0 1px",
          }}
        >
          {MARKS.map((mark, index) => (
            <span key={`${mark}-${index}`}>{mark}</span>
          ))}
        </div>
      </div>
      <div
        style={{
          gridColumn: "1 / -1",
          display: "flex",
          flexWrap: "wrap",
          gap: "6px 14px",
          paddingTop: 4,
        }}
      >
        {MOODS.map((mood) => (
          <MoodSwatch key={mood.key} mood={mood.key} on={mood.key === reading.mood} />
        ))}
      </div>
    </section>
  );
}
