import { fireEvent, render, screen } from "@testing-library/react";

import { ThemeSwitch } from "./ThemeSwitch";
import { VoicesTheme } from "./VoicesTheme";

test("names the way it will switch and swaps the theme", () => {
  render(
    <VoicesTheme mode="light">
      <ThemeSwitch />
    </VoicesTheme>,
  );
  const control = screen.getByRole("button", { name: "Switch to dark" });
  expect(control).toHaveAttribute("data-mode", "light");
  fireEvent.click(control);
  expect(screen.getByRole("button", { name: "Switch to light" })).toHaveAttribute(
    "data-mode",
    "dark",
  );
  expect(document.documentElement).toHaveAttribute("data-theme", "dark");
});
