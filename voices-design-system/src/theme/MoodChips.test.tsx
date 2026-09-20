import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { inkFor } from "./contrast";
import { MoodChips } from "./MoodChips";
import { VoicesTheme } from "./VoicesTheme";

test("deals seven chips, highlights one, and closes on the cross", async () => {
  const onClose = vi.fn();
  render(
    <VoicesTheme mode="light">
      <MoodChips open highlight="heated" onClose={onClose} />
    </VoicesTheme>,
  );
  const dialog = screen.getByRole("dialog", { name: "Moods" });
  expect(dialog.querySelectorAll(".sv-chip")).toHaveLength(7);
  expect(dialog.querySelector('.sv-chip[data-mood="heated"]')).toHaveAttribute("data-on", "true");
  expect(screen.getByText("#F5E571 → #C9B52E")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(onClose).toHaveBeenCalled();
});

test("renders nothing when closed", () => {
  render(
    <VoicesTheme mode="light">
      <MoodChips open={false} onClose={() => {}} />
    </VoicesTheme>,
  );
  expect(screen.queryByRole("dialog")).toBeNull();
});

test("inkFor picks ink on a light chip and mist on a dark one", () => {
  expect(inkFor("#F5E571")).toBe("#1D201D");
  expect(inkFor("#2374AB")).toBe("#E8F1F1");
});
