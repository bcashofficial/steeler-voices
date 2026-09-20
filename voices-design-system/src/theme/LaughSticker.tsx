import { palette } from "./tokens";
import { WORDS } from "./vocab";

export interface LaughStickerProps {
  size?: number;
}

/** The die-cut laughing sticker that marks a voice read as sarcasm: gold
 *  face, eyes shut, head tilted, two blue tears, a white sticker edge. */
export function LaughSticker({ size = 30 }: LaughStickerProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      role="img"
      aria-label={WORDS.sarcasm}
      style={{
        flex: "none",
        filter:
          "drop-shadow(0 0 0 #fff) drop-shadow(0 0 1.5px #fff) drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
      }}
    >
      <g transform="rotate(-14 20 20)">
        <circle cx="20" cy="21" r="14" fill={palette.gold} stroke={palette.ink} strokeWidth="2" />
        <path
          d="M13 18c1.5-2.5 4-2.5 5.5 0M21.5 18c1.5-2.5 4-2.5 5.5 0"
          fill="none"
          stroke={palette.ink}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path d="M12.5 24c2 6 13 6 15 0z" fill={palette.ink} />
        <path
          d="M15.5 27.5c3 1.5 6 1.5 9 0"
          fill="none"
          stroke="#fff"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path d="M8 22c-1.5 1.5-1.5 4 0 4.5 1.5.5 2.2-2.5 0-4.5z" fill={palette.blue} />
        <path d="M32 22c1.5 1.5 1.5 4 0 4.5-1.5.5-2.2-2.5 0-4.5z" fill={palette.blue} />
      </g>
    </svg>
  );
}
