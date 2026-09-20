import { clockFor, coverHeightFor, dayFor, handleFor, teamFor, timeFor } from "./format";

test("writes a time the way the sheet does, in Pittsburgh's zone", () => {
  expect(timeFor("2026-09-17T17:16:59Z")).toBe("Thu 1:16 PM");
  expect(dayFor("2026-09-20T17:00:00Z")).toBe("Sun Sep 20");
  expect(clockFor("2026-09-20T17:00:00Z")).toBe("1:00 PM");
});

test("writes a reddit handle as u/name", () => {
  expect(handleFor("Stealth_Well_worn")).toBe("u/Stealth_Well_worn");
  expect(handleFor("someone", "discord")).toBe("someone");
  expect(teamFor("steelers")).toBe("Steelers");
});

test("picks a cover height by id, the same every time", () => {
  expect(coverHeightFor("88727a8a")).toBe(coverHeightFor("88727a8a"));
  expect([84, 88, 96, 104, 110, 120, 132]).toContain(coverHeightFor("anything"));
});
