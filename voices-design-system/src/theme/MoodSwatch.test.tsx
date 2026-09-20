import { render, screen } from "@testing-library/react";

import { MoodSwatch } from "./MoodSwatch";
import { VoicesTheme } from "./VoicesTheme";

test("shows the word and marks the one that is on", () => {
  render(
    <VoicesTheme mode="light">
      <MoodSwatch mood="proud" />
      <MoodSwatch mood="heated" on />
    </VoicesTheme>,
  );
  expect(screen.getByText("Proud").parentElement).toHaveAttribute("data-on", "false");
  expect(screen.getByText("Heated").parentElement).toHaveAttribute("data-on", "true");
});
