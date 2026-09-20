/**
 * The map: the week's embeddings flattened to two dimensions, the seven
 * moods as the legend, the week's topics as rows that press to keep their
 * dots, and the voices retrieved most often by the generator.
 */

import { useState } from "react";

import { MoodSwatch, MOODS, Pane, StencilNumber, SubjectRow, TextLink } from "design_system/theme";

import { paths } from "../api/client";
import type { Week, WeekMap } from "../api/types";
import { useRead } from "../api/useRead";
import { handleFor } from "../format";
import { BODY } from "../text";
import { topicRows } from "./mapRows";
import { Scatter } from "./Scatter";

interface MapSectionProps {
  week: Week;
  platform: string;
}

export function MapSection({ week, platform }: MapSectionProps) {
  const map = useRead<WeekMap>(paths.map(week.starts_on));
  const [pressed, setPressed] = useState<string | null>(null);
  if (!map.data) return null;
  const rows = topicRows(map.data.points);
  return (
    <div className="sv-split">
      <Pane>
        <Scatter points={map.data.points} pressed={pressed} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingTop: 12 }}>
          {MOODS.map((mood) => (
            <MoodSwatch key={mood.key} mood={mood.key} />
          ))}
        </div>
      </Pane>
      <div style={{ display: "grid", gap: 16 }}>
        <Pane>
          <div className="sv-stack">
            {rows.map((row) => (
              <SubjectRow
                key={row.label}
                label={row.label}
                count={row.count}
                shares={row.shares}
                pressed={pressed === row.label}
                onPress={() => setPressed(pressed === row.label ? null : row.label)}
              />
            ))}
          </div>
        </Pane>
        {map.data.most_retrieved.length ? (
          <Pane>
            <div style={{ display: "grid", gap: 10 }}>
              {map.data.most_retrieved.map((voice) => (
                <div
                  key={voice.voice_id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                    gap: 10,
                    alignItems: "start",
                  }}
                >
                  <StencilNumber value={voice.retrievals} height={18} offset={2} />
                  <div style={{ display: "grid", gap: 2 }}>
                    <TextLink href={voice.external_url} size="sm">
                      {handleFor(voice.handle, platform)}
                    </TextLink>
                    <p style={BODY}>{voice.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Pane>
        ) : null}
      </div>
    </div>
  );
}
