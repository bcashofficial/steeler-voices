/**
 * VoiceMessage — one voice in the thread, Discord-style: the avatar, the
 * handle, the time, the points right-aligned, an OP tag on the poster, the
 * title for a post, the body, and its pulse. A reply indents under a
 * rounded connector. Hover and focus report the reading upward so the
 * scoreboard can play it.
 */

import { useEffect, type CSSProperties } from "react";

import { Avatar } from "./Avatar";
import { PulseBar } from "./PulseBar";
import type { Reading } from "./Scoreboard";
import { StencilNumber } from "./StencilNumber";
import { mountStyle } from "./styles";
import { typography } from "./tokens";
import { WORDS } from "./vocab";

export interface Voice {
  handle: string;
  /** Already formatted for display — "Thu 1:19 PM". */
  time: string;
  points?: number | null;
  title?: string;
  body: string;
  op?: boolean;
}

export interface VoiceMessageProps {
  voice: Voice;
  reading: Reading;
  reply?: boolean;
  onFocusReading?: (reading: Reading) => void;
  style?: CSSProperties;
}

const STYLE_ID = "sv-voice";
const CSS = `
.sv-voice{display:grid;grid-template-columns:34px 1fr;gap:10px;padding:8px;border-radius:8px;position:relative;outline:none}
.sv-voice:hover,.sv-voice:focus-visible{background:var(--sv-hover)}
.sv-voice:focus-visible{box-shadow:inset 0 0 0 2px var(--sv-blue)}
.sv-voice[data-reply="true"]{margin-left:44px}
.sv-voice[data-reply="true"]::before{content:"";position:absolute;left:-22px;top:-6px;width:16px;height:22px;border-left:1.5px solid var(--sv-line-strong);border-bottom:1.5px solid var(--sv-line-strong);border-bottom-left-radius:6px}
.sv-voice-head{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;font-family:${typography.body};font-size:14px}
.sv-voice-head b{font-weight:600;color:var(--sv-ink)}
.sv-voice-time{color:var(--sv-ink-3);font-size:12px}
.sv-voice-op{font-size:10.5px;font-weight:700;letter-spacing:0.06em;padding:1px 6px;border-radius:4px;background:var(--sv-gold);color:var(--sv-gold-ink)}
.sv-voice-pts{margin-left:auto;display:inline-flex;align-items:center;gap:4px;color:var(--sv-ink-3)}
.sv-voice p{margin:2px 0 6px;font-family:${typography.body};font-size:14px;line-height:1.45;color:var(--sv-ink)}
.sv-voice p.sv-voice-title{font-weight:600;font-size:15px}
`;

export function VoiceMessage({
  voice,
  reading,
  reply = false,
  onFocusReading,
  style,
}: VoiceMessageProps) {
  useEffect(() => mountStyle(STYLE_ID, CSS), []);
  const report = () => onFocusReading?.(reading);
  return (
    <article
      className="sv-voice"
      data-reply={reply}
      tabIndex={0}
      onMouseEnter={report}
      onFocus={report}
      style={style}
    >
      <Avatar handle={voice.handle} />
      <div style={{ minWidth: 0 }}>
        <div className="sv-voice-head">
          <b>{voice.handle}</b>
          {voice.op ? <span className="sv-voice-op">{WORDS.op}</span> : null}
          <span className="sv-voice-time">{voice.time}</span>
          {voice.points != null ? (
            <span className="sv-voice-pts">
              <StencilNumber value={voice.points} height={12} offset={0} color="var(--sv-ink-3)" />
            </span>
          ) : null}
        </div>
        {voice.title ? <p className="sv-voice-title">{voice.title}</p> : null}
        <p>{voice.body}</p>
        <div style={{ maxWidth: 520 }}>
          <PulseBar
            mood={reading.mood}
            yards={reading.yards}
            sarcasm={reading.sarcasm}
            animate={false}
          />
        </div>
      </div>
    </article>
  );
}
