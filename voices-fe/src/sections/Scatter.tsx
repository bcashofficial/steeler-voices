/**
 * The flattened embeddings as a field of dots: each voice at its projected
 * place, in its mood's color (the line color when unread), a hair larger
 * for every time it has been retrieved. A pressed topic keeps its dots and
 * fades the rest; hovering a dot names the voice.
 */

import type { MapPoint } from "../api/types";
import { frameFor, place } from "./mapRows";

const WIDTH = 1000;
const HEIGHT = 620;

interface ScatterProps {
  points: MapPoint[];
  pressed: string | null;
}

function fillFor(point: MapPoint): string {
  return point.mood ? `var(--sv-mood-${point.mood}-from)` : "var(--sv-line-strong)";
}

export function Scatter({ points, pressed }: ScatterProps) {
  const frame = frameFor(points);
  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      style={{
        width: "100%",
        height: "auto",
        display: "block",
        background: "var(--sv-field)",
        borderRadius: 12,
      }}
    >
      {points.map((point) => {
        const [x, y] = place(point, frame, WIDTH, HEIGHT);
        const kept = pressed === null || point.topic === pressed;
        return (
          <circle
            key={point.voice_id}
            cx={x}
            cy={y}
            r={3 + Math.min(6, point.retrievals)}
            fill={fillFor(point)}
            opacity={kept ? 0.85 : 0.12}
            data-mood={point.mood ?? undefined}
          >
            <title>{point.text}</title>
          </circle>
        );
      })}
    </svg>
  );
}
