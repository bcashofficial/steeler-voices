/**
 * PostCard — a post in the rail: the town-square property card, tailored.
 *
 * The cover runs edge to edge at whatever height the consumer gives it: a
 * plate in the thread's loudest mood (its gradient), the comment count in
 * the stencil digits over it, a halftone screen fading down it, a Photo /
 * Link tag when the post has media, and the thread's mood mix as a lane
 * strip along the bottom. When the post has an image it sits under the
 * halftone in place of the plate. Below: the title at 600 with a StatusDot
 * for the loudest mood on its baseline, then the handle and time, muted.
 * A thread no reading has reached yet makes no claim: a plain plate in the
 * field color, no dot, no lanes.
 *
 * It always carries the card shadow — the one object meant to read as an
 * object. It lifts and rises 2px on hover; the selected card wears a 2px
 * ink ring. Click, Enter or Space select it.
 */

import { useEffect, type CSSProperties, type KeyboardEvent } from "react";

import { inkFor } from "./contrast";
import { loudestMood } from "./loudest";
import { MoodMix } from "./MoodMix";
import type { MoodShare } from "./pulseMath";
import { StatusDot } from "./StatusDot";
import { StencilNumber } from "./StencilNumber";
import { mountStyle } from "./styles";
import { moodStops, motion, palette, radius, typography } from "./tokens";
import { useVoicesTheme } from "./VoicesThemeContext";
import { moodByKey, WORDS } from "./vocab";

export interface Post {
  title: string;
  /** The poster's handle. */
  who: string;
  /** The time as the platform writes it: "Thu 1:16 PM". */
  when: string;
  media?: "photo" | "link";
  /** The post's image, sat under the halftone in place of the plate. */
  image?: string;
}

export interface PostCardProps {
  post: Post;
  /** The thread's comment count. */
  count: number;
  /** The thread's 100 yards by mood; the loudest colors the cover and the dot. */
  shares: readonly MoodShare[];
  selected?: boolean;
  onSelect?: () => void;
  /** The cover's height in px; the rail varies it card to card. */
  coverHeight?: number;
  className?: string;
  style?: CSSProperties;
}

const STYLE_ID = "sv-postcard";
const LANES: CSSProperties = { position: "absolute", left: 8, right: 8, bottom: 8, width: "auto" };
const HALFTONE = `color-mix(in srgb, ${palette.ink} 28%, transparent)`;
const CSS = `
.sv-postcard{position:relative;display:block;overflow:hidden;cursor:pointer;background:var(--sv-surface);border-radius:${radius.md}px;box-shadow:var(--sv-shadow);transition:transform ${motion.underline},box-shadow ${motion.underline};font-family:${typography.body};color:var(--sv-ink)}
.sv-postcard:hover{transform:translateY(-2px);box-shadow:var(--sv-shadow-lift)}
.sv-postcard[aria-current="true"]{box-shadow:0 0 0 2px var(--sv-ink),var(--sv-shadow)}
.sv-postcard[aria-current="true"]:hover{box-shadow:0 0 0 2px var(--sv-ink),var(--sv-shadow-lift)}
.sv-postcard:focus-visible{outline:2px solid var(--sv-blue);outline-offset:2px}
.sv-postcard-cover{position:relative;display:grid;place-items:center;overflow:hidden;background:linear-gradient(90deg,var(--sv-postcard-from),var(--sv-postcard-to))}
.sv-postcard-cover>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.sv-postcard-cover::before{content:"";position:absolute;inset:0;background-image:radial-gradient(${HALFTONE} 1px,transparent 1.2px);background-size:6px 6px;opacity:.55;-webkit-mask-image:linear-gradient(180deg,transparent,#000);mask-image:linear-gradient(180deg,transparent,#000);pointer-events:none}
.sv-postcard-num{position:relative;display:inline-block;line-height:0}
.sv-postcard-num>[aria-hidden]{position:absolute;left:2px;top:2px}
.sv-postcard-num>[role]{position:relative}
.sv-postcard-tag{position:absolute;left:8px;top:8px;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;line-height:1.3;padding:2px 6px;background:var(--sv-ground);color:var(--sv-ink);border-radius:4px}
.sv-postcard-txt{padding:10px 12px 12px}
.sv-postcard-ttl{display:flex;justify-content:space-between;gap:8px;align-items:baseline}
.sv-postcard-ttl>span{font-weight:600;font-size:13.5px;line-height:1.3}
.sv-postcard-meta{color:var(--sv-ink-3);font-size:${typography.scale.small.fontSize}px;line-height:${typography.scale.small.lineHeight};margin-top:3px}
.sv-postcard-meta>b{color:var(--sv-ink-2);font-weight:500}
@media (prefers-reduced-motion: reduce){.sv-postcard{transition:none}}
`;

export function PostCard({
  post,
  count,
  shares,
  selected = false,
  onSelect,
  coverHeight = 110,
  className,
  style,
}: PostCardProps) {
  useEffect(() => mountStyle(STYLE_ID, CSS), []);
  const { mode } = useVoicesTheme();
  const mood = shares.length ? loudestMood(shares) : null;
  // Over an image the plate is unknown, so the digits go mist with the gold
  // offset; over a mood's plate they follow its luminance, the offset the
  // other way; over the plain field plate they are the theme's ink.
  const ink = post.image
    ? palette.mist
    : mood
      ? inkFor(moodStops[mode][mood].from)
      : "var(--sv-ink)";
  const offset = ink === palette.ink ? palette.mist : palette.gold;

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect?.();
    }
  };

  return (
    <article
      className={["sv-postcard", className].filter(Boolean).join(" ")}
      tabIndex={0}
      aria-current={selected ? "true" : undefined}
      data-mood={mood ?? undefined}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      style={
        {
          "--sv-postcard-from": mood ? moodByKey[mood].from : "var(--sv-field)",
          "--sv-postcard-to": mood ? moodByKey[mood].to : "var(--sv-field)",
          ...style,
        } as CSSProperties
      }
    >
      <div className="sv-postcard-cover" style={{ height: coverHeight }}>
        {post.image ? <img src={post.image} alt="" /> : null}
        {post.media ? (
          <span className="sv-postcard-tag">
            {post.media === "photo" ? WORDS.photo : WORDS.link}
          </span>
        ) : null}
        <span className="sv-postcard-num">
          <span aria-hidden="true">
            <StencilNumber value={count} height={44} offset={0} color={offset} />
          </span>
          <StencilNumber value={count} height={44} offset={0} color={ink} />
        </span>
        {mood ? <MoodMix shares={shares} size="sm" style={LANES} /> : null}
      </div>
      <div className="sv-postcard-txt">
        <div className="sv-postcard-ttl">
          <span>{post.title}</span>
          {mood ? <StatusDot mood={mood} /> : null}
        </div>
        <div className="sv-postcard-meta">
          <b>{post.who}</b> · {post.when}
        </div>
      </div>
    </article>
  );
}
