import { MOODS, StatusDot, typography } from "../../theme";
import { Figure } from "./shared";

export function StatusDotPlate() {
  return (
    <Figure label="Moods">
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 24px" }}>
        {MOODS.map((mood) => (
          <span
            key={mood.key}
            style={{
              display: "inline-flex",
              alignItems: "baseline",
              gap: 8,
              fontFamily: typography.body,
              fontSize: 13.5,
              fontWeight: 600,
              lineHeight: 1.3,
            }}
          >
            <span>{mood.label}</span>
            <StatusDot mood={mood.key} />
          </span>
        ))}
      </div>
    </Figure>
  );
}
