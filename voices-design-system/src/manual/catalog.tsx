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
import { StatusDotPlate } from "./plates/RailPlates";

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
      planned(
        "text-link",
        "TextLink",
        "Renders as an anchor or a button. The 3px gold underline draws in from the left on hover and focus; current keeps it and sets the text to full ink at 600. Nothing on the platform looks like a button.",
        ["as: 'a' | 'button'", "current?: boolean", "children"],
      ),
      planned(
        "avatar",
        "Avatar",
        "34px, radius 8, the handle's initial in Anton on gold, blue, olive or ink (chosen by a stable hash of the handle so a fan keeps their color).",
        ["handle: string", "size?: number"],
      ),
      planned(
        "voice-message",
        "VoiceMessage",
        "Avatar, handle 600, time, points right-aligned, the OP tag on the poster, the title for a post, the body, and a sm PulseBar. A reply indents 44px under a rounded connector. Hover and focus report the reading upward so the scoreboard can play it.",
        ["voice: Voice", "reading: Reading", "reply?: boolean", "onFocusReading?"],
      ),
      planned(
        "pane",
        "Pane",
        "No border. Transparent at rest; on hover or focus-within it takes the surface color, lifts on the big shadow, and rises 2px. PaneBar is its title line: a gold caret square, a name, and an optional Numeral in the corner.",
        ["children", "bar?: { title, count? }"],
      ),
      planned(
        "group-tabs",
        "GroupTabs",
        "Three TextLinks as tabs, from vocab.GROUPINGS. The selected one carries the underline.",
        ["value: GroupingKey", "onChange"],
      ),
      planned(
        "subject-row",
        "SubjectRow",
        "Name 600, count in ink3 tabular, a MoodMix across the row. Pressed rows carry a 3px gold bar on the left. Click keeps only that subject's voices in the thread.",
        ["label", "count", "shares", "pressed?", "onPress"],
      ),
    ],
  },
  {
    key: "rail",
    label: "The rail",
    plates: [
      planned(
        "post-card",
        "PostCard",
        "Cover edge to edge (a mood-colored plate with the comment count in Anton 44, a halftone fading down it, a Photo/Link tag, the post's image under the halftone when it has one, and a MoodMix lane strip along the bottom), then title 600 with a StatusDot on one baseline and a muted meta line. Lifts on hover; the selected card wears a 2px ink ring.",
        ["post", "count", "shares", "selected?", "onSelect"],
      ),
      planned(
        "masonry",
        "Masonry",
        "column-width: 200px, gap 12; children avoid breaking. Stacks to one column below 980px with the rest of the board.",
        ["children"],
      ),
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
      planned(
        "football",
        "Football",
        "An ink ball with gold laces and seams, 34×22; tilts 8° on hover.",
        ["onClick", "label"],
      ),
      planned(
        "section-menu",
        "SectionMenu",
        "The current section as a TextLink with a chevron; the sheet lists every section from vocab.SECTIONS with its count as a Numeral, a hairline before Pipelines, halftone fading from its top edge. Esc and click-away close it.",
        ["current: SectionKey", "counts", "onSelect"],
      ),
      planned(
        "theme-switch",
        "ThemeSwitch",
        "One icon; click swaps the theme through useVoicesTheme. Its accessible name says which way it will switch.",
        [],
      ),
      planned(
        "flyer",
        "Flyer",
        "Over a 55% ink scrim with a 2px blur: a 560px sheet on radius 6, halftone fading from the top, the name in Anton 58, a DoubleRule, the matchup in Anton 34 with at in Helvetica Neue, three Numerals over micro caps (Posts · Comments · Subjects), the top subjects with counts, the DoubleRule again, and Open the board as a TextLink. Closes on the link, the backdrop or Esc.",
        ["week", "game", "counts", "subjects", "open", "onClose"],
      ),
      planned(
        "double-rule",
        "DoubleRule",
        "The flyer's rule: a 3px ink line with a 1px line 5px beneath it.",
        [],
      ),
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
