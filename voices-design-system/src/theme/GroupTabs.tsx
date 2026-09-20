/**
 * GroupTabs — By subject · By topic · By mood, as text links; the selected
 * one carries the underline.
 */

import type { CSSProperties } from "react";

import { TextLink } from "./TextLink";
import { GROUPINGS, type GroupingKey } from "./vocab";

export interface GroupTabsProps {
  value: GroupingKey;
  onChange: (value: GroupingKey) => void;
  style?: CSSProperties;
}

export function GroupTabs({ value, onChange, style }: GroupTabsProps) {
  return (
    <div role="tablist" style={{ display: "flex", gap: 2, ...style }}>
      {GROUPINGS.map((grouping) => (
        <TextLink
          key={grouping.key}
          role="tab"
          size="sm"
          aria-selected={grouping.key === value}
          onClick={() => onChange(grouping.key)}
          style={{ margin: "0 8px" }}
        >
          {grouping.label}
        </TextLink>
      ))}
    </div>
  );
}
