/**
 * The platform's ways of writing things down: a time as "Thu 1:16 PM" in
 * Pittsburgh's zone, a handle as the community writes it, a card's cover
 * height chosen by its id so the rail varies without a random.
 */

const COMMUNITY_TIME_ZONE = "America/New_York";
const timeFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  hour: "numeric",
  minute: "2-digit",
  timeZone: COMMUNITY_TIME_ZONE,
});
const clockFormat = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: COMMUNITY_TIME_ZONE,
});
const dayFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: COMMUNITY_TIME_ZONE,
});

/** "Thu 1:16 PM" — the weekday and the clock, the way the sheet writes it. */
export function timeFor(iso: string): string {
  return timeFormat.format(new Date(iso)).replace(",", "");
}

/** "7:04 AM" — the clock alone, after a day. */
export function clockFor(iso: string): string {
  return clockFormat.format(new Date(iso));
}

/** "Sun Sep 20" — for a kickoff or a run. */
export function dayFor(iso: string): string {
  return dayFormat.format(new Date(iso)).replace(",", "");
}

/** Reddit writes a handle as u/name; another platform writes it plain. */
export function handleFor(handle: string, platform = "reddit"): string {
  return platform === "reddit" ? `u/${handle}` : handle;
}

/** The team the community is named for: "steelers" → "Steelers". */
export function teamFor(community: string): string {
  return community.charAt(0).toUpperCase() + community.slice(1);
}

const COVER_HEIGHTS = [84, 88, 96, 104, 110, 120, 132];

/** A stable pick from the sheet's cover heights, by the post's id. */
export function coverHeightFor(id: string): number {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return COVER_HEIGHTS[hash % COVER_HEIGHTS.length];
}
