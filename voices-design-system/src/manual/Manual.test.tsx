import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { VoicesTheme } from "../theme";
import { Manual } from "./Manual";

beforeEach(() => {
  window.location.hash = "";
});

test("opens on the contents and turns to a plate from the index", async () => {
  render(
    <VoicesTheme mode="light">
      <Manual />
    </VoicesTheme>,
  );
  expect(screen.getByRole("heading", { name: "Every plate" })).toBeInTheDocument();
  await userEvent.click(
    screen.getByRole("navigation").querySelector('[data-planned="false"]:nth-of-type(1)')!,
  );
  expect(window.location.hash).toBe("#palette");
  expect(screen.getByRole("heading", { name: "Palette" })).toBeInTheDocument();
});

test("a planned plate shows its spec", () => {
  window.location.hash = "#double-rule";
  render(
    <VoicesTheme mode="light">
      <Manual />
    </VoicesTheme>,
  );
  expect(screen.getByRole("heading", { name: "DoubleRule" })).toBeInTheDocument();
  expect(screen.getByText("Planned")).toBeInTheDocument();
});
