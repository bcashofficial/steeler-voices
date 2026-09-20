/**
 * The stencil digits — ten numerals drawn from circles and straight strokes
 * of one weight, with a cut wherever two strokes would meet. Each glyph is a
 * list of SVG strokes on a 100 × 140 grid, stroked at DIGIT_STROKE with
 * butt caps; a dash pattern on a circle is how a cut is placed on a curve.
 */

export const DIGIT_WIDTH = 100;
export const DIGIT_HEIGHT = 140;
export const DIGIT_STROKE = 22;
export const DIGIT_GAP = 12;
export const COMMA_WIDTH = 30;

export interface Stroke {
  d: string;
  /** A dash pattern to cut the stroke; used on circles. */
  dash?: string;
}

// A circle as a path so it can be dashed from its 3 o'clock point clockwise.
const circle = (cx: number, cy: number, r: number) =>
  `M ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`;

export const DIGITS: Record<string, Stroke[]> = {
  "0": [{ d: circle(50, 70, 44), dash: "96 16 100 16 200" }, { d: "M 30 104 L 70 36" }],
  "1": [{ d: "M 24 40 L 60 18" }, { d: "M 60 30 L 60 140" }],
  "2": [
    { d: "M 20 50 A 34 34 0 1 1 84 52" },
    { d: "M 78 66 L 26 122" },
    { d: "M 20 130 L 88 130" },
  ],
  "3": [{ d: "M 20 12 L 84 12" }, { d: "M 78 22 L 48 60" }, { d: "M 54 66 A 34 34 0 1 1 24 118" }],
  "4": [{ d: "M 66 12 L 12 96" }, { d: "M 12 104 L 90 104" }, { d: "M 66 24 L 66 140" }],
  "5": [{ d: "M 28 12 L 86 12" }, { d: "M 28 22 L 28 60" }, { d: "M 34 67 A 36 36 0 1 1 21 116" }],
  "6": [{ d: circle(50, 102, 34), dash: "184 30 300" }, { d: "M 58 12 L 30 62" }],
  "7": [{ d: "M 16 12 L 86 12" }, { d: "M 84 26 Q 84 80 40 140" }],
  "8": [
    { d: circle(50, 40, 28), dash: "148 28 300" },
    { d: circle(50, 100, 34), dash: "60 28 300" },
  ],
  "9": [{ d: circle(50, 38, 34), dash: "40 30 300" }, { d: "M 80 56 L 52 140" }],
};

export const COMMA: Stroke[] = [{ d: "M 20 118 L 8 140" }];

/** The glyph for one character of a formatted count, or null for a space. */
export function glyphFor(char: string): { strokes: Stroke[]; width: number } | null {
  if (char === ",") return { strokes: COMMA, width: COMMA_WIDTH };
  const strokes = DIGITS[char];
  return strokes ? { strokes, width: DIGIT_WIDTH } : null;
}
