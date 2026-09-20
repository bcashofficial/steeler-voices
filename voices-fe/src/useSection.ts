/**
 * Which section the app is on rides the URL hash — #board, #document,
 * #map, #ab, #pipelines — so a link lands on a section and the back
 * button works. Anything else is the board.
 */

import { useEffect, useState } from "react";

import { SECTIONS, type SectionKey } from "design_system/theme";

const KEYS = SECTIONS.map((section) => section.key) as readonly string[];

export function sectionFromHash(hash: string): SectionKey {
  const key = hash.replace(/^#/, "");
  return (KEYS.includes(key) ? key : "board") as SectionKey;
}

export function useSection(): [SectionKey, (section: SectionKey) => void] {
  const [section, setSection] = useState<SectionKey>(() => sectionFromHash(window.location.hash));
  useEffect(() => {
    const onHash = () => setSection(sectionFromHash(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const go = (next: SectionKey) => {
    window.location.hash = next;
    setSection(next);
  };
  return [section, go];
}
