/**
 * SectionMenu — Board · Document · Map · A/B · Pipelines, as a dropdown of
 * the five sections from the vocab, each with its count. Sits in the
 * masthead's right slot beside the ThemeSwitch.
 */

import type { CSSProperties } from "react";

import { Dropdown } from "./Dropdown";
import { SECTIONS, type SectionKey } from "./vocab";

export interface SectionMenuProps {
  current: SectionKey;
  /** A count per section; a section without one shows none. */
  counts?: Partial<Record<SectionKey, number>>;
  onSelect: (section: SectionKey) => void;
  style?: CSSProperties;
}

export function SectionMenu({ current, counts = {}, onSelect, style }: SectionMenuProps) {
  const options = SECTIONS.map((section) => ({ ...section, count: counts[section.key] }));
  return (
    <Dropdown<SectionKey>
      options={options}
      value={current}
      onChange={onSelect}
      size="sm"
      style={{ width: 180, ...style }}
    />
  );
}
