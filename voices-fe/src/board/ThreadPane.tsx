/**
 * The thread pane: the post and the voices under it, Discord-style, headed
 * by the scoreboard, which rests on the post's reading and plays whichever
 * voice the pointer or focus is on. A voice answering another voice
 * indents as a reply; one answering the post sits flush. Voices the
 * tagger has not read yet show without a pulse.
 */

import { useState } from "react";

import { Pane, Scoreboard, VoiceMessage, WORDS, type Reading } from "design_system/theme";

import type { Thread, ThreadVoice } from "../api/types";
import { handleFor, timeFor } from "../format";
import { readingFor } from "./groupings";

interface ThreadPaneProps {
  thread: Thread;
  /** The voices to show under the post — all of them, or a pressed row's. */
  kept: ThreadVoice[];
  comments: number;
  platform: string;
}

function messageFor(voice: ThreadVoice, platform: string) {
  return {
    handle: handleFor(voice.handle, platform),
    time: timeFor(voice.posted_at),
    points: voice.score,
    title: voice.title || undefined,
    body: voice.body,
    op: voice.op,
  };
}

/** The reading the scoreboard rests on: the post's, else the first read voice's. */
function restingReading(thread: Thread, platform: string): Reading | null {
  const first = [thread.post, ...thread.voices].find((voice) => voice.reading);
  return first ? readingFor(first, handleFor(first.handle, platform)) : null;
}

export function ThreadPane({ thread, kept, comments, platform }: ThreadPaneProps) {
  const [current, setCurrent] = useState<Reading | null>(null);
  const resting = restingReading(thread, platform);
  return (
    <Pane bar={{ title: `${WORDS.thread} — ${thread.post.title}`, count: comments }}>
      {resting ? <Scoreboard resting={resting} current={current} /> : null}
      <div className="sv-stack" onMouseLeave={() => setCurrent(null)}>
        <VoiceMessage
          voice={messageFor(thread.post, platform)}
          reading={readingFor(thread.post, handleFor(thread.post.handle, platform))}
          onFocusReading={setCurrent}
        />
        {kept.map((voice) => (
          <VoiceMessage
            key={voice.voice_id}
            voice={messageFor(voice, platform)}
            reading={readingFor(voice, handleFor(voice.handle, platform))}
            reply={voice.parent_id !== null && voice.parent_id !== thread.post.voice_id}
            onFocusReading={setCurrent}
          />
        ))}
      </div>
    </Pane>
  );
}
