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
import { LaughStickerPlate, PulseBarPlate } from "./plates/PulsePlates";

export type PlateStatus = "built" | "planned";

export interface PlateEntry {
  key: string;
  label: string;
  status: PlateStatus;
  /** One line under the running head: what the plate is. */
  gloss: string;
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

const planned = (
  key: string,
  label: string,
  gloss: string,
  what: string,
  props: string[],
): PlateEntry => ({ key, label, status: "planned", gloss, spec: { what, props } });

export const PARTS: PartEntry[] = [
  {
    key: "foundations",
    label: "Foundations",
    plates: [
      {
        key: "palette",
        label: "Palette",
        status: "built",
        gloss: "Five colors, two grounds.",
        Component: PalettePlate,
      },
      {
        key: "typography",
        label: "Typography",
        status: "built",
        gloss: "Anton for display, Archivo for the rest, the gold offset.",
        Component: TypographyPlate,
      },
      {
        key: "grounds",
        label: "Grounds",
        status: "built",
        gloss: "The leather under everything, the grain over it.",
        Component: GroundsPlate,
      },
      {
        key: "motion",
        label: "Motion",
        status: "built",
        gloss: "Three durations. Nothing else moves.",
        Component: MotionPlate,
      },
      {
        key: "words",
        label: "Words",
        status: "built",
        gloss: "The vocabulary, mirrored from the backend.",
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
        gloss: "A reading as a 100-yard field of ticks.",
        Component: PulseBarPlate,
      },
      {
        key: "laugh-sticker",
        label: "LaughSticker",
        status: "built",
        gloss: "The die-cut mark of a voice read as sarcasm.",
        Component: LaughStickerPlate,
      },
      planned(
        "mood-mix",
        "MoodMix",
        "A thread's 100 yards split by mood.",
        "A single segmented pill: one segment per mood, sized by its share of the voices, in the mood's gradient. Under a subject row and along the bottom of a post card's cover as the lane strip.",
        ["shares: { mood, share }[]", "size: 'sm' | 'md'"],
      ),
      planned(
        "mood-swatch",
        "MoodSwatch",
        "One mood, as a legend entry.",
        "A short gradient pill and the mood word; `on` gives it the gold underline. Seven of them make the scoreboard's legend.",
        ["mood", "on?: boolean"],
      ),
      planned(
        "scoreboard",
        "Scoreboard",
        "The legend that plays back whichever voice you're on.",
        "Yardage in Anton 54 with the gold offset over `yards` in micro caps; the mood word and handle; a `lg` PulseBar; G·10·20·30·40·50·40·30·20·10·G beneath in Anton 11; the seven swatches. `play(reading)` rolls the digits, re-fills the field in the new mood, and lights the swatch; `settle()` returns to the resting reading.",
        ["resting: Reading", "current?: Reading", "onSettle?"],
      ),
      planned(
        "numeral",
        "Numeral",
        "A big number in Anton with the gold offset.",
        "Every count on the platform that stands in for a sentence: the flyer's three, a pane's corner, a section's count in the menu. Three sizes; tabular; optional caption in micro caps.",
        ["value: number", "size: 'sm' | 'md' | 'lg'", "caption?: string", "roll?: boolean"],
      ),
    ],
  },
  {
    key: "board",
    label: "The board",
    plates: [
      planned(
        "text-link",
        "TextLink",
        "The one control: text and a gold underline.",
        "Renders as an anchor or a button. The 3px gold underline draws in from the left on hover and focus; `current` keeps it and sets the text to full ink at 600. Nothing on the platform looks like a button.",
        ["as: 'a' | 'button'", "current?: boolean", "children"],
      ),
      planned(
        "avatar",
        "Avatar",
        "A square with an initial in Anton.",
        "34px, radius 8, the handle's initial in Anton on gold, blue, olive or ink (chosen by a stable hash of the handle so a fan keeps their color).",
        ["handle: string", "size?: number"],
      ),
      planned(
        "voice-message",
        "VoiceMessage",
        "One voice in the thread, Discord-style.",
        "Avatar, handle 600, time, points right-aligned, the OP tag on the poster, the title for a post, the body, and a `sm` PulseBar. A reply indents 44px under a rounded connector. Hover and focus report the reading upward so the scoreboard can play it.",
        ["voice: Voice", "reading: Reading", "reply?: boolean", "onFocusReading?"],
      ),
      planned(
        "pane",
        "Pane",
        "A container that lifts when looked at.",
        "No border. Transparent at rest; on hover or focus-within it takes the surface color, lifts on the big shadow, and rises 2px. `PaneBar` is its title line: a gold caret square, a name, and an optional Numeral in the corner.",
        ["children", "bar?: { title, count? }"],
      ),
      planned(
        "group-tabs",
        "GroupTabs",
        "By subject · By topic · By mood.",
        "Three TextLinks as tabs, from `vocab.GROUPINGS`. The selected one carries the underline.",
        ["value: GroupingKey", "onChange"],
      ),
      planned(
        "subject-row",
        "SubjectRow",
        "A subject, its count, and its mood mix.",
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
        "The town-square property card, tailored.",
        "Cover edge to edge (a mood-colored plate with the comment count in Anton 44, a halftone fading down it, a Photo/Link tag, the post's image under the halftone when it has one, and a MoodMix lane strip along the bottom), then title 600 with a StatusDot on one baseline and a muted meta line. Lifts on hover; the selected card wears a 2px ink ring.",
        ["post", "count", "shares", "selected?", "onSelect"],
      ),
      planned(
        "masonry",
        "Masonry",
        "CSS-column masonry for the rail.",
        "`column-width: 200px`, gap 12; children avoid breaking. Stacks to one column below 980px with the rest of the board.",
        ["children"],
      ),
      planned(
        "status-dot",
        "StatusDot",
        "A dot that means one thing.",
        "8px, an ink ring, the mood's color. On a card it is the thread's loudest mood; an accessible label says so.",
        ["mood", "label"],
      ),
    ],
  },
  {
    key: "chrome",
    label: "Chrome and the flyer",
    plates: [
      planned(
        "masthead",
        "Masthead",
        "The name, the football, the rule.",
        "Steeler Voices in Anton 46 with the gold offset, the Football beside it, a 3px ink rule under the whole line; a right slot for the SectionMenu and ThemeSwitch.",
        ["onFootball", "children (right slot)"],
      ),
      planned(
        "football",
        "Football",
        "The icon that reopens the flyer.",
        "An ink ball with gold laces and seams, 34×22; tilts 8° on hover.",
        ["onClick", "label"],
      ),
      planned(
        "section-menu",
        "SectionMenu",
        "One word, a chevron, a lifted sheet.",
        "The current section as a TextLink with a chevron; the sheet lists every section from `vocab.SECTIONS` with its count as a Numeral, a hairline before Pipelines, halftone fading from its top edge. Esc and click-away close it.",
        ["current: SectionKey", "counts", "onSelect"],
      ),
      planned(
        "theme-switch",
        "ThemeSwitch",
        "A moon in light, a sun in dark.",
        "One icon; click swaps the theme through `useVoicesTheme`. Its accessible name says which way it will switch.",
        [],
      ),
      planned(
        "flyer",
        "Flyer",
        "The week's program cover.",
        "Over a 55% ink scrim with a 2px blur: a 560px sheet on radius 6, halftone fading from the top, the name in Anton 58, a DoubleRule, the matchup in Anton 34 with `at` in Archivo, three Numerals over micro caps (Posts · Comments · Subjects), the top subjects with counts, the DoubleRule again, and `Open the board` as a TextLink. Closes on the link, the backdrop or Esc.",
        ["week", "game", "counts", "subjects", "open", "onClose"],
      ),
      planned(
        "double-rule",
        "DoubleRule",
        "3px over 1px.",
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
