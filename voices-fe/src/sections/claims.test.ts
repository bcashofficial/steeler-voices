import type { Citation } from "../api/types";
import { citationsFor } from "./claims";

const cite = (evidence: number | null, handle: string): Citation => ({
  evidence,
  voice_id: handle,
  handle,
  external_url: "",
  rank: 1,
  distance: 0.2,
  quote: "",
});

test("a claim's citations are the ones for its evidence indices", () => {
  const citations = [cite(2, "a"), cite(5, "b"), cite(null, "c")];
  expect(citationsFor({ text: "", evidence: [5, 9] }, citations).map((c) => c.handle)).toEqual([
    "b",
  ]);
  expect(citationsFor({ text: "", evidence: [] }, citations)).toEqual([]);
});
