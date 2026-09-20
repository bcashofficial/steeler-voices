/**
 * The map's arithmetic: the points of a week grouped by topic into rows
 * with a count and a mood mix, and the frame that fits every point.
 */

import type { MoodKey } from "design_system/theme";

import type { MapPoint, MoodShare } from "../api/types";

export interface TopicRow {
  label: string;
  count: number;
  shares: MoodShare[];
}

function sharesOf(points: readonly MapPoint[]): MoodShare[] {
  const counts = new Map<MoodKey, number>();
  for (const point of points) {
    if (point.mood) counts.set(point.mood, (counts.get(point.mood) ?? 0) + 1);
  }
  const total = [...counts.values()].reduce((sum, n) => sum + n, 0);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([mood, n]) => ({ mood, share: n / total }));
}

/** One row per topic the points name, largest first. */
export function topicRows(points: readonly MapPoint[]): TopicRow[] {
  const members = new Map<string, MapPoint[]>();
  for (const point of points) {
    if (point.topic) members.set(point.topic, [...(members.get(point.topic) ?? []), point]);
  }
  return [...members.entries()]
    .map(([label, kept]) => ({ label, count: kept.length, shares: sharesOf(kept) }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export interface Frame {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/** The smallest frame around every point, a hair wider so none sits on the edge. */
export function frameFor(points: readonly MapPoint[], pad = 0.04): Frame {
  if (!points.length) return { minX: 0, maxX: 1, minY: 0, maxY: 1 };
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const [minX, maxX, minY, maxY] = [
    Math.min(...xs),
    Math.max(...xs),
    Math.min(...ys),
    Math.max(...ys),
  ];
  const padX = (maxX - minX || 1) * pad;
  const padY = (maxY - minY || 1) * pad;
  return { minX: minX - padX, maxX: maxX + padX, minY: minY - padY, maxY: maxY + padY };
}

/** A point's place in a width × height picture, y up. */
export function place(
  point: MapPoint,
  frame: Frame,
  width: number,
  height: number,
): [number, number] {
  const x = ((point.x - frame.minX) / (frame.maxX - frame.minX)) * width;
  const y = height - ((point.y - frame.minY) / (frame.maxY - frame.minY)) * height;
  return [x, y];
}
