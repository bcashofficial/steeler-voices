/**
 * The readings pane: the grouping — by subject, topic or mood — then one
 * row per group with its count and its mood mix. A pressed row keeps only
 * its voices in the thread; pressing it again lets them all back.
 */

import { GroupTabs, Pane, SubjectRow, type GroupingKey } from "design_system/theme";

import type { GroupRow } from "./groupings";

interface ReadingsPaneProps {
  grouping: GroupingKey;
  onGrouping: (grouping: GroupingKey) => void;
  rows: GroupRow[];
  pressed: string | null;
  onPress: (key: string | null) => void;
}

export function ReadingsPane({ grouping, onGrouping, rows, pressed, onPress }: ReadingsPaneProps) {
  return (
    <Pane>
      <div style={{ padding: "4px 0 8px" }}>
        <GroupTabs value={grouping} onChange={onGrouping} />
      </div>
      <div className="sv-stack">
        {rows.map((row) => (
          <SubjectRow
            key={row.key}
            label={row.label}
            count={row.count}
            shares={row.shares}
            pressed={pressed === row.key}
            onPress={() => onPress(pressed === row.key ? null : row.key)}
          />
        ))}
      </div>
    </Pane>
  );
}
