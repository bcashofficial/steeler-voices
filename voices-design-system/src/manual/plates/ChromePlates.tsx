import { useState } from "react";

import {
  DoubleRule,
  Flyer,
  Football,
  Masthead,
  SectionMenu,
  ThemeSwitch,
  type SectionKey,
} from "../../theme";
import { Figure } from "./shared";

export function DoubleRulePlate() {
  return (
    <Figure label="Rule">
      <div style={{ maxWidth: 560 }}>
        <DoubleRule />
      </div>
    </Figure>
  );
}

export function FootballPlate() {
  return (
    <Figure label="Sizes">
      <div style={{ display: "flex", gap: 24, alignItems: "flex-end" }}>
        <Football />
        <Football size={51} />
        <Football size={68} />
      </div>
    </Figure>
  );
}

export function ThemeSwitchPlate() {
  return (
    <Figure label="Icon">
      <div>
        <ThemeSwitch />
      </div>
    </Figure>
  );
}

const COUNTS = { board: 61, document: 2, map: 4212, ab: 3, pipelines: 8 } as const;

export function MastheadPlate() {
  const [section, setSection] = useState<SectionKey>("board");
  return (
    <Figure label="Line">
      <Masthead>
        <SectionMenu current={section} counts={COUNTS} onSelect={setSection} />
        <ThemeSwitch />
      </Masthead>
    </Figure>
  );
}

export function SectionMenuPlate() {
  const [section, setSection] = useState<SectionKey>("board");
  return (
    <Figure label="Sections">
      <SectionMenu current={section} counts={COUNTS} onSelect={setSection} />
    </Figure>
  );
}

const WEEK = {
  game: { away: "Steelers", home: "Patriots" },
  counts: { posts: 61, comments: 4212, subjects: 7 },
  subjects: [
    { label: "Joey Porter Jr.", count: 1204 },
    { label: "Omar Khan", count: 318 },
    { label: "Aaron Rodgers", count: 296 },
    { label: "Pittman", count: 141 },
  ],
};

export function FlyerPlate() {
  const [open, setOpen] = useState(false);
  return (
    <Figure label="Open">
      <div>
        <Football onClick={() => setOpen(true)} />
      </div>
      <Flyer open={open} onClose={() => setOpen(false)} {...WEEK} />
    </Figure>
  );
}
