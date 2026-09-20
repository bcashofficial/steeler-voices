import { sectionFromHash } from "./useSection";

test("reads the section from the hash and falls back to the board", () => {
  expect(sectionFromHash("#map")).toBe("map");
  expect(sectionFromHash("#pipelines")).toBe("pipelines");
  expect(sectionFromHash("")).toBe("board");
  expect(sectionFromHash("#nowhere")).toBe("board");
});
