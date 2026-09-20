import type { MapPoint } from "../api/types";
import { frameFor, place, topicRows } from "./mapRows";

const point = (overrides: Partial<MapPoint>): MapPoint => ({
  voice_id: "v",
  x: 0,
  y: 0,
  mood: null,
  topic: null,
  text: "",
  retrievals: 0,
  ...overrides,
});

test("rows the points by topic, largest first, with a mood mix", () => {
  const rows = topicRows([
    point({ topic: "the secondary", mood: "heated" }),
    point({ topic: "the secondary", mood: "level" }),
    point({ topic: "Watt", mood: "proud" }),
    point({ mood: "proud" }),
  ]);
  expect(rows.map((r) => [r.label, r.count])).toEqual([
    ["the secondary", 2],
    ["Watt", 1],
  ]);
  expect(rows[0].shares).toHaveLength(2);
});

test("frames every point with a hair of padding and places y up", () => {
  const points = [point({ x: 0, y: 0 }), point({ x: 10, y: 5 })];
  const frame = frameFor(points, 0);
  expect(frame).toEqual({ minX: 0, maxX: 10, minY: 0, maxY: 5 });
  expect(place(points[1], frame, 100, 50)).toEqual([100, 0]);
  expect(place(points[0], frame, 100, 50)).toEqual([0, 50]);
  expect(frameFor([], 0)).toEqual({ minX: 0, maxX: 1, minY: 0, maxY: 1 });
});
