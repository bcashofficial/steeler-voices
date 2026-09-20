import { allPlates, findPlate, PARTS } from "./catalog";

test("every plate has a unique key and a way to render", () => {
  const plates = allPlates();
  expect(new Set(plates.map((p) => p.key)).size).toBe(plates.length);
  for (const plate of plates) {
    expect(plate.status === "built" ? plate.Component : plate.spec).toBeTruthy();
  }
});

test("plates are numbered by part and position", () => {
  expect(findPlate("pulse-bar")?.number).toBe("02.1");
  expect(findPlate("palette")?.number).toBe("01.1");
  expect(findPlate("nope")).toBeNull();
  expect(PARTS[0].label).toBe("Foundations");
});
