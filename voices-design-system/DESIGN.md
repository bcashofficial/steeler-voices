# Steeler Voices — Design Language

The canonical reference for how Steeler Voices looks, feels and behaves.
Written from the approved board sheet (`docs/board-sheet.html`, open it in a
browser) and the type sheet (`docs/type-sheet.html`). Tokens live in
`src/theme/tokens.ts`; the words in `src/theme/vocab.ts`. When this document
and the code disagree, the code wins — then fix this document.

## 1. The metaphor: a game program, on the ball

Steeler Voices reads like a 1960s game-day program printed on the skin of a
football. The metaphor governs the materials, not the information
architecture:

- **The pulse** — every voice is measured in yards on a 100-yard field.
- **The scoreboard** — the legend that plays back whichever voice you're on.
- **The flyer** — the week's program cover, shown before the board.
- **The leather** — pebbled grain under everything; **the grain film** over
  everything, the print.
- **The sticker** — a die-cut laughing face marks a voice read as sarcasm.

## 2. Palette

From the coolors.co scheme:

| Token | Hex | Role |
|---|---|---|
| `ink` | `#1D201D` | text in light; the ground in dark |
| `gold` | `#F5E571` | the one accent: the display offset, the underline, Hyped/Hopeful |
| `mist` | `#E8F1F1` | the pulse track and tints in light; text in dark |
| `blue` | `#2374AB` | a component alternate: Proud/Level, focus rings, the sticker's tears |
| `olive` | `#697A21` | a component alternate: Uneasy/Frustrated |
| `white` | `#FFFFFF` | the ground in light, pure |

Two themes, both rooted in these. **Light:** pure white ground and surface;
ink text; mist is a tint. **Dark:** the ink is the ground, `#262A26` the
surface, mist the text. Ink hierarchy on either ground is three alpha steps
of the ink (`ink`, `ink2` 64%, `ink3` 42%); lines are 16% and 32%. The
switch is one icon: a moon in light, a sun in dark. First load follows the
OS, then the choice is remembered.

## 3. Type

Two faces, both self-hosted (SIL OFL):

- **Anton** — display. The masthead, the flyer title, every big number, the
  matchup, the count in a pane's corner. One weight. Its signature is the
  **gold offset** — `text-shadow: 3px 3px 0 gold` (2px at smaller sizes) —
  a print that slipped a hair.
- **Archivo** — everything else, 400–700. Body 14/1.45; titles 15/600;
  small 12/500; micro labels 11/600 tracked 0.1em, uppercase.

Regular punctuation and case. Numbers over words: where a count can stand
in for a sentence, it does, in Anton.

## 4. Surfaces: no borders, spacing and lift

Nothing is separated by a border. Containers sit on the ground with spacing
between them; the one being looked at (hover or focus within) takes the
surface color, lifts on `shadowLift`, and rises 2px. Cards are the
exception that always carries the card shadow — they are the one object
meant to read as an object. Radius: 12 on panes, cards, sheets; 8 on rows
and avatars; 6 on the flyer; pill on every track.

**Nothing looks like a button.** Every control is text. The only affordance
is the gold underline (3px) drawing in from the left on hover and focus;
the selected one keeps it and goes to full ink at 600. Icons (the football,
the sun/moon) are the other two controls; they tilt or swap on hover.

## 5. The pulse

A voice's reading is a **pulse bar**: a 100-yard field of fifty thin ticks
(two yards each), spread across the width the consumer gives it, every fifth
tick taller for a ten-yard line. The filled run takes the mood's gradient
tick by tick; the rest sit in the line color. Above it, on one row: a dot in
the mood's color, the mood word in micro caps, and the yardage in a gold
chip that rolls to its value (`66 yd`).

It plays. On mount the ticks rise in sequence, left to right (14ms apart).
The head tick — the one on the yard line — breathes. The cursor raises a
wave of ticks as it passes over the field. Under reduced motion it simply
is. Sizes: `sm` for a thread row, `md`, `lg` for the scoreboard.

Seven moods on five colors — pairs share a hue and differ in where the
gradient goes. The stops are per theme, because a stop that reads on the
ink vanishes on white:

| Mood | Light: from → to | Dark: from → to |
|---|---|---|
| Hyped | gold → `#C9B52E` | gold → `#FFF6B0` |
| Hopeful | gold → olive | gold → olive |
| Proud | blue → `#6FB4E8` | blue → `#6FB4E8` |
| Level | blue → `#8FAEC4` | blue → `#9DB9CC` |
| Uneasy | olive → `#AEBF58` | olive → `#AEBF58` |
| Frustrated | olive → `#3A3F1A` | olive → `#3A3F1A` |
| Heated | ink → blue | mist → blue |

Sarcasm is a flag, not a mood: the laughing sticker at the end of the pulse
row. The same seven definitions (`tokens.moodStops` → `--sv-mood-*`) paint
every pulse bar, the scoreboard, the subject mixes, the card lane strips and
the legend swatches — the mapping lives in one place.

**The scoreboard** heads the thread pane: yardage in Anton 54 with the gold
offset, `yards` under it in micro caps, the mood word and handle, a `lg`
pulse field with G·10·20·30·40·50·40·30·20·10·G marked beneath in Anton 11,
and the seven swatches. Hovering or focusing any voice plays it: the digits
roll (420ms, ease-out cubic), the field re-fills to the voice's yardage in
its mood, the swatch takes the gold underline. Leaving the thread settles
it back to the post.

## 6. The board

Masthead: the name in Anton 46 with the gold offset, the football beside
it, a 3px ink rule under the whole line. Right: the section menu (one word
and a chevron; a lifted sheet lists every section with its count in Anton
and a hairline before Pipelines) and the theme icon.

Below, 75 / 25:

- **Left, the pane group** (iTerm split, no frame): **Thread** 1.55fr and
  the readings pane 1fr. The thread is Discord-style — a square avatar
  (initial in Anton on gold, blue, olive or ink), handle 600, time, points
  right-aligned, an `OP` tag on the poster, the body, the pulse. Replies
  indent 44px under a rounded connector. The readings pane opens with the
  grouping tabs (By subject · By topic · By mood) as text links, then rows:
  subject 600, count, and a segmented mix of the thread's 100 yards by mood.
  A pressed row carries a 3px gold bar on its left.
- **Right, the rail:** the town-square property card, tailored. CSS-column
  masonry (200px), covers edge to edge at varying heights, title 600 with a
  status dot (the thread's loudest mood) on one baseline, a muted meta line.
  The cover is a mood-colored plate with the comment count in Anton 44, a
  halftone screen fading down it, a `Photo` / `Link` tag when the post has
  media, and the lane strip of the thread's mood mix along the bottom. In
  the app a post's image sits under the halftone. Lift on hover; the
  selected card wears a 2px ink ring.

Below 980px the grid stacks to one column.

## 7. The flyer

Shown first, over a dimmed board (55% ink scrim, 2px blur): a 560px sheet
on `radius.flyer`, halftone fading from the top edge, the name in Anton 58
with the offset, a double rule (3px + 1px), the matchup in Anton 34 with
"at" in Archivo, three numbers in Anton 40 over micro caps (Posts ·
Comments · Subjects), the top subjects with counts, the double rule again,
and "Open the board" as a text link. Closes on that link, the backdrop, or
Esc; the football reopens it.

## 8. Words

All of them are in `src/theme/vocab.ts`, mirrored from voices-be
`lookups/vocab.py`. Neither file invents a word the other doesn't have.

## 9. Component inventory

Built one at a time, each with a section in voices-fe's playground:

`PulseBar` · `MoodMix` · `MoodSwatch` · `Scoreboard` · `LaughSticker` ·
`Numeral` · `TextLink` · `Avatar` · `VoiceMessage` · `Pane` · `PaneBar` ·
`GroupTabs` · `SubjectRow` · `PostCard` · `Masonry` · `StatusDot` ·
`Masthead` · `Football` · `SectionMenu` · `ThemeSwitch` · `Flyer` ·
`DoubleRule`.
