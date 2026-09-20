/**
 * The rail: the week's posts as cards in a masonry, headed by the count.
 * Selecting a card opens its thread on the board.
 */

import { Masonry, PostCard, StencilNumber, WORDS } from "design_system/theme";

import type { RailPost } from "../api/types";
import { Display } from "../Display";
import { coverHeightFor, handleFor, timeFor } from "../format";

interface RailProps {
  posts: RailPost[];
  selectedId: string | null;
  onSelect: (voiceId: string) => void;
  platform: string;
}

export function Rail({ posts, selectedId, onSelect, platform }: RailProps) {
  return (
    <aside className="sv-rail">
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <Display>{WORDS.posts}</Display>
        <StencilNumber value={posts.length} height={22} offset={2} />
      </div>
      <Masonry>
        {posts.map((post) => (
          <PostCard
            key={post.voice_id}
            post={{
              title: post.title,
              who: handleFor(post.handle, platform),
              when: timeFor(post.posted_at),
            }}
            count={post.comments}
            shares={post.shares}
            coverHeight={coverHeightFor(post.voice_id)}
            selected={post.voice_id === selectedId}
            onSelect={() => onSelect(post.voice_id)}
          />
        ))}
      </Masonry>
    </aside>
  );
}
