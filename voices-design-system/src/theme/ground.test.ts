import { leatherTile } from "./ground";

test("the leather tile is deterministic and escapes the hash for a data uri", () => {
  expect(leatherTile("#1D201D")).toBe(leatherTile("#1D201D"));
  expect(leatherTile("#1D201D")).not.toContain("#");
  expect(leatherTile("#1D201D")).toContain("%231D201D");
});
