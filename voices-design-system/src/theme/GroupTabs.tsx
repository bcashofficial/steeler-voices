/**
 * GroupTabs — By subject · By topic · By mood, as a dropdown of the three
 * groupings from the vocab.
 */

import type { CSSProperties } from "react";

import { Dropdown } from "./Dropdown";
import { GROUPINGS, type GroupingKey } from "./vocab";

export interface GroupTabsProps {
  value: GroupingKey;
  onChange: (value: GroupingKey) => void;
  style?: CSSProperties;
}

export function GroupTabs({ value, onChange, style }: GroupTabsProps) {
  return (
    <Dropdown<GroupingKey>
      options={GROUPINGS}
      value={value}
      onChange={onChange}
      size="sm"
      style={{ width: 160, ...style }}
    />
  );
}
