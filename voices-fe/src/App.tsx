/**
 * The app: the masthead — the week, the section menu, the theme — and the
 * section it is on, for the week it is on. The flyer opens over the board
 * the first time a session lands; the football reopens it.
 */

import { useEffect, useState } from "react";

import { Dropdown, Masthead, SectionMenu, ThemeSwitch, type SectionKey } from "design_system/theme";

import { paths } from "./api/client";
import type { Pipeline, Vocab, Week, WeekDetail } from "./api/types";
import { useRead } from "./api/useRead";
import { Board } from "./board/Board";
import { teamFor } from "./format";
import { mountAppStyle } from "./layout";
import { AbSection } from "./sections/AbSection";
import { DocumentSection } from "./sections/DocumentSection";
import { MapSection } from "./sections/MapSection";
import { PipelinesSection } from "./sections/PipelinesSection";
import { WeekFlyer } from "./sections/WeekFlyer";
import { useSection } from "./useSection";

const FLYER_SEEN_KEY = "steeler-voices-flyer";

function flyerSeen(): boolean {
  try {
    return sessionStorage.getItem(FLYER_SEEN_KEY) === "seen";
  } catch {
    return false;
  }
}

function rememberFlyer(): void {
  try {
    sessionStorage.setItem(FLYER_SEEN_KEY, "seen");
  } catch {
    // a private window forgets; the flyer simply shows again
  }
}

function sectionCounts(
  detail: WeekDetail | null,
  pipelines: number,
): Partial<Record<SectionKey, number>> {
  if (!detail) return { pipelines };
  return {
    board: detail.counts.posts,
    document: detail.counts.documents,
    map: detail.counts.projected,
    ab: detail.counts.generation_runs,
    pipelines,
  };
}

export function App() {
  useEffect(mountAppStyle, []);
  const weeks = useRead<{ weeks: Week[] }>(paths.weeks);
  const vocab = useRead<Vocab>(paths.vocab);
  const pipelines = useRead<{ pipelines: Pipeline[] }>(paths.pipelines);
  const [section, setSection] = useSection();
  const [chosenWeek, setChosenWeek] = useState<string | null>(null);
  const [flyerOpen, setFlyerOpen] = useState(() => !flyerSeen());

  const week =
    weeks.data?.weeks.find((w) => w.starts_on === chosenWeek) ?? weeks.data?.weeks[0] ?? null;
  const detail = useRead<WeekDetail>(week ? paths.week(week.starts_on) : null);
  const source = vocab.data?.sources[0];
  const platform = source?.platform ?? "reddit";
  const team = teamFor(source?.community ?? "");

  const closeFlyer = () => {
    setFlyerOpen(false);
    rememberFlyer();
  };

  return (
    <div className="sv-app">
      <Masthead onFootball={() => setFlyerOpen(true)}>
        {weeks.data ? (
          <Dropdown
            options={weeks.data.weeks.map((w) => ({
              key: w.starts_on,
              label: w.label,
              count: w.posts,
            }))}
            value={week?.starts_on ?? null}
            onChange={setChosenWeek}
            size="sm"
            style={{ width: 200 }}
          />
        ) : null}
        <SectionMenu
          current={section}
          counts={sectionCounts(detail.data, pipelines.data?.pipelines.length ?? 0)}
          onSelect={setSection}
        />
        <ThemeSwitch />
      </Masthead>
      {week && section === "board" ? <Board week={week} platform={platform} /> : null}
      {week && section === "document" ? <DocumentSection week={week} platform={platform} /> : null}
      {week && section === "map" ? <MapSection week={week} platform={platform} /> : null}
      {week && section === "ab" ? <AbSection week={week} platform={platform} /> : null}
      {section === "pipelines" ? <PipelinesSection /> : null}
      {detail.data ? (
        <WeekFlyer detail={detail.data} team={team} open={flyerOpen} onClose={closeFlyer} />
      ) : null}
    </div>
  );
}
