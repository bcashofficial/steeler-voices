/**
 * The manual's catalog: every part, every plate, in reading order. A plate
 * is either built (it renders the primitive) or planned (it renders the
 * spec the primitive will be built to). Numbers are derived from position,
 * so inserting a plate renumbers what follows — as a book would.
 */

import type { ComponentType } from "react";

import {
  GroundsPlate,
  MotionPlate,
  PalettePlate,
  TypographyPlate,
  WordsPlate,
} from "./plates/Foundations";
import {
  LaughStickerPlate,
  MoodMixPlate,
  MoodSwatchPlate,
  NumeralPlate,
  PulseBarPlate,
  ScoreboardPlate,
} from "./plates/PulsePlates";
import {
  AvatarPlate,
  GroupTabsPlate,
  PanePlate,
  SubjectRowPlate,
  DropdownPlate,
  VoiceMessagePlate,
} from "./plates/BoardPlates";
import { DoubleRulePlate, FootballPlate, ThemeSwitchPlate } from "./plates/ChromePlates";
import { MasonryPlate, PostCardPlate, StatusDotPlate } from "./plates/RailPlates";

export type PlateStatus = "built" | "planned";

export interface PlateEntry {
  key: string;
  label: string;
  status: PlateStatus;
  /** Built plates render this. */
  Component?: ComponentType;
  /** Planned plates render this: the spec from DESIGN.md, and the props expected. */
  spec?: { what: string; props: string[] };
}

export interface PartEntry {
  key: string;
  label: string;
  plates: PlateEntry[];
}

const planned = (key: string, label: string, what: string, props: string[]): PlateEntry => ({
  key,
  label,
  status: "planned",
  spec: { what, props },
});

export const PARTS: PartEntry[] = [
  {
    key: "foundations",
    label: "Foundations",
    plates: [
      {
        key: "palette",
        label: "Palette",
        status: "built",
        Component: PalettePlate,
      },
      {
        key: "typography",
        label: "Typography",
        status: "built",
        Component: TypographyPlate,
      },
      {
        key: "grounds",
        label: "Grounds",
        status: "built",
        Component: GroundsPlate,
      },
      {
        key: "motion",
        label: "Motion",
        status: "built",
        Component: MotionPlate,
      },
      {
        key: "words",
        label: "Words",
        status: "built",
        Component: WordsPlate,
      },
    ],
  },
  {
    key: "pulse",
    label: "The pulse",
    plates: [
      {
        key: "pulse-bar",
        label: "PulseBar",
        status: "built",
        Component: PulseBarPlate,
      },
      {
        key: "laugh-sticker",
        label: "LaughSticker",
        status: "built",
        Component: LaughStickerPlate,
      },
      { key: "mood-mix", label: "MoodMix", status: "built", Component: MoodMixPlate },
      { key: "mood-swatch", label: "MoodSwatch", status: "built", Component: MoodSwatchPlate },
      { key: "scoreboard", label: "Scoreboard", status: "built", Component: ScoreboardPlate },
      { key: "numeral", label: "Numeral", status: "built", Component: NumeralPlate },
    ],
  },
  {
    key: "board",
    label: "The board",
    plates: [
      { key: "dropdown", label: "Dropdown", status: "built", Component: DropdownPlate },
      { key: "avatar", label: "Avatar", status: "built", Component: AvatarPlate },
      { key: "voice-message", label: "VoiceMessage", status: "built", Component: VoiceMessagePlate },
      { key: "pane", label: "Pane", status: "built", Component: PanePlate },
      { key: "group-tabs", label: "GroupTabs", status: "built", Component: GroupTabsPlate },
      { key: "subject-row", label: "SubjectRow", status: "built", Component: SubjectRowPlate },
    ],
  },
  {
    key: "rail",
    label: "The rail",
    plates: [
      { key: "post-card", label: "PostCard", status: "built", Component: PostCardPlate },
      { key: "masonry", label: "Masonry", status: "built", Component: MasonryPlate },
      { key: "status-dot", label: "StatusDot", status: "built", Component: StatusDotPlate },
    ],
  },
  {
    key: "chrome",
    label: "Chrome and the flyer",
    plates: [
      planned(
        "masthead",
        "Masthead",
        "Steeler Voices in Anton 46 with the gold offset, the Football beside it, a 3px ink rule under the whole line; a right slot for the SectionMenu and ThemeSwitch.",
        ["onFootball", "children (right slot)"],
      ),
      { key: "football", label: "Football", status: "built", Component: FootballPlate },
      planned(
        "section-menu",
        "SectionMenu",
        "The current section as a TextLink with a chevron; the sheet lists every section from vocab.SECTIONS with its count as a Numeral, a hairline before Pipelines, halftone fading from its top edge. Esc and click-away close it.",
        ["current: SectionKey", "counts", "onSelect"],
      ),
      { key: "theme-switch", label: "ThemeSwitch", status: "built", Component: ThemeSwitchPlate },
      planned(
        "flyer",
        "Flyer",
        "Over a 55% ink scrim with a 2px blur: a 560px sheet on radius 6, halftone fading from the top, the name in Anton 58, a DoubleRule, the matchup in Anton 34 with at in Helvetica Neue, three Numerals over micro caps (Posts · Comments · Subjects), the top subjects with counts, the DoubleRule again, and Open the board as a TextLink. Closes on the link, the backdrop or Esc.",
        ["week", "game", "counts", "subjects", "open", "onClose"],
      ),
      { key: "double-rule", label: "DoubleRule", status: "built", Component: DoubleRulePlate },
    ],
  },
];

export interface NumberedPlate extends PlateEntry {
  part: PartEntry;
  number: string;
}

/** Every plate with its part and its number (`02.1`). */
export function allPlates(): NumberedPlate[] {
  return PARTS.flatMap((part, partIndex) =>
    part.plates.map((plate, plateIndex) => ({
      ...plate,
      part,
      number: `${String(partIndex + 1).padStart(2, "0")}.${plateIndex + 1}`,
    })),
  );
}

export function findPlate(key: string): NumberedPlate | null {
  return allPlates().find((plate) => plate.key === key) ?? null;
}
