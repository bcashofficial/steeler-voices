import { render, screen } from "@testing-library/react";

import { MoodMix } from "./MoodMix";
import { describeMix } from "./pulseMath";
import { VoicesTheme } from "./VoicesTheme";

const shares = [
  { mood: "heated", share: 0.31 },
  { mood: "frustrated", share: 0.27 },
  { mood: "level", share: 0 },
] as const;

test("draws one segment per share, sized by it, and says what it shows", () => {
  render(
    <VoicesTheme mode="light">
      <MoodMix shares={shares} label="Joey Porter Jr." />
    </VoicesTheme>,
  );
  const mix = screen.getByRole("img", { name: "Joey Porter Jr.: Heated 31%, Frustrated 27%" });
  const segments = mix.querySelectorAll("i");
  expect(segments).toHaveLength(3);
  expect(segments[0]).toHaveStyle({ width: "31%" });
});

test("describeMix skips empty shares", () => {
  expect(describeMix(shares)).toBe("Heated 31%, Frustrated 27%");
});
