/**
 * The board: the pane group on the left — the thread and its readings — and
 * the rail of the week's posts on the right. The first post opens by
 * default; a card in the rail opens another. A pressed row in the readings
 * pane narrows the thread to its voices.
 */

import { useEffect, useMemo, useState } from "react";

import type { GroupingKey } from "design_system/theme";

import { paths } from "../api/client";
import type { RailPost, Thread, Week } from "../api/types";
import { useRead } from "../api/useRead";
import { groupVoices, keepVoices } from "./groupings";
import { Rail } from "./Rail";
import { ReadingsPane } from "./ReadingsPane";
import { ThreadPane } from "./ThreadPane";

interface BoardProps {
  week: Week;
  platform: string;
}

export function Board({ week, platform }: BoardProps) {
  const rail = useRead<{ posts: RailPost[] }>(paths.posts(week.starts_on));
  const posts = useMemo(() => rail.data?.posts ?? [], [rail.data]);
  const [chosenId, setChosenId] = useState<string | null>(null);
  const selectedId = chosenId ?? posts[0]?.voice_id ?? null;
  const thread = useRead<Thread>(selectedId ? paths.thread(selectedId) : null);
  const [grouping, setGrouping] = useState<GroupingKey>("subject");
  const [pressed, setPressed] = useState<string | null>(null);

  useEffect(() => setChosenId(null), [week.starts_on]);
  useEffect(() => setPressed(null), [selectedId, grouping]);

  const voices = useMemo(() => thread.data?.voices ?? [], [thread.data]);
  const rows = useMemo(() => groupVoices(voices, grouping), [voices, grouping]);
  const kept = useMemo(() => keepVoices(voices, grouping, pressed), [voices, grouping, pressed]);
  const selected = posts.find((post) => post.voice_id === selectedId);

  return (
    <div className="sv-split">
      <section className="sv-panes">
        {thread.data && selected ? (
          <ThreadPane
            thread={thread.data}
            kept={kept}
            comments={selected.comments}
            platform={platform}
          />
        ) : (
          <div />
        )}
        <ReadingsPane
          grouping={grouping}
          onGrouping={setGrouping}
          rows={rows}
          pressed={pressed}
          onPress={setPressed}
        />
      </section>
      <Rail posts={posts} selectedId={selectedId} onSelect={setChosenId} platform={platform} />
    </div>
  );
}
