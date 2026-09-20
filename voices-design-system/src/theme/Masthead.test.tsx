import { fireEvent, render, screen } from "@testing-library/react";

import { Masthead } from "./Masthead";
import { ThemeSwitch } from "./ThemeSwitch";
import { VoicesTheme } from "./VoicesTheme";

test("names the product, holds the ball, and fills the right slot", () => {
  const onFootball = vi.fn();
  render(
    <VoicesTheme mode="light">
      <Masthead onFootball={onFootball}>
        <ThemeSwitch />
      </Masthead>
    </VoicesTheme>,
  );
  expect(screen.getByRole("banner")).toBeInTheDocument();
  expect(screen.getByRole("heading", { level: 1, name: "Steeler Voices" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Open this week's flyer" }));
  expect(onFootball).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("button", { name: "Switch to dark" })).toBeInTheDocument();
});
