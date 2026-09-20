import { moodStops, palette, themes } from "./tokens";
import { MOODS, moodByKey } from "./vocab";

test("light ground is pure white and dark ground is the ink", () => {
  expect(themes.light.ground).toBe("#FFFFFF");
  expect(themes.dark.ground).toBe(palette.ink);
});

test("both themes define the same semantic roles", () => {
  expect(Object.keys(themes.light).sort()).toEqual(Object.keys(themes.dark).sort());
});

test("seven moods, each with a unique key and word", () => {
  expect(MOODS).toHaveLength(7);
  expect(new Set(MOODS.map((m) => m.key)).size).toBe(7);
  expect(new Set(MOODS.map((m) => m.label)).size).toBe(7);
  expect(moodByKey.heated.to).toBe("var(--sv-mood-heated-to)");
  expect(moodStops.light.heated.from).toBe("#FF0000");
  expect(moodStops.dark.heated.from).toBe("#FF0000");
});
