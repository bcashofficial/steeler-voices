import type { ThreadVoice } from "../api/types";
import { groupVoices, keepVoices, moodShares, readingFor } from "./groupings";

const voice = (overrides: Partial<ThreadVoice>): ThreadVoice => ({
  voice_id: "v",
  handle: "fan",
  posted_at: "2026-09-17T17:16:59Z",
  score: 1,
  title: "",
  body: "",
  external_url: "",
  depth: 0,
  parent_id: null,
  op: false,
  reading: null,
  topic: null,
  ...overrides,
});
const read = (
  mood: "heated" | "uneasy" | "level",
  subjects: string[],
  topic: string | null = null,
) => voice({ reading: { mood, yards: 50, sarcasm: false, subjects, gist: "" }, topic });

const VOICES = [
  read("heated", ["Joey Porter Jr."], "the secondary"),
  read("heated", ["Joey Porter Jr.", "Omar Khan"], "the secondary"),
  read("uneasy", ["Omar Khan"]),
  voice({}),
];

test("shares split the read voices by mood, loudest first", () => {
  expect(moodShares(VOICES)).toEqual([
    { mood: "heated", share: 2 / 3 },
    { mood: "uneasy", share: 1 / 3 },
  ]);
  expect(moodShares([voice({})])).toEqual([]);
});

test("groups by subject, topic and mood with counts and a mix", () => {
  const bySubject = groupVoices(VOICES, "subject");
  expect(bySubject.map((r) => [r.label, r.count])).toEqual([
    ["Joey Porter Jr.", 2],
    ["Omar Khan", 2],
  ]);
  expect(bySubject[0].shares).toEqual([{ mood: "heated", share: 1 }]);
  expect(groupVoices(VOICES, "topic")).toHaveLength(1);
  expect(groupVoices(VOICES, "mood").map((r) => r.label)).toEqual(["Heated", "Uneasy"]);
});

test("a pressed row keeps only its voices", () => {
  expect(keepVoices(VOICES, "subject", "Omar Khan")).toHaveLength(2);
  expect(keepVoices(VOICES, "mood", "uneasy")).toHaveLength(1);
  expect(keepVoices(VOICES, "subject", null)).toHaveLength(4);
});

test("a reading for the scoreboard carries who said it", () => {
  expect(readingFor(VOICES[2], "u/fan")).toEqual({
    mood: "uneasy",
    yards: 50,
    who: "u/fan",
    sarcasm: false,
  });
  expect(readingFor(VOICES[3], "u/fan")).toBeNull();
});
