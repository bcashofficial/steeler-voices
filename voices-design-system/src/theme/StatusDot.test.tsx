import { render, screen } from "@testing-library/react";

import { StatusDot } from "./StatusDot";
import { VoicesTheme } from "./VoicesTheme";

test("names itself by the mood word", () => {
  render(
    <VoicesTheme mode="light">
      <StatusDot mood="uneasy" />
    </VoicesTheme>,
  );
  const dot = screen.getByRole("img", { name: "Uneasy" });
  expect(dot).toHaveAttribute("data-mood", "uneasy");
});

test("takes a label over the mood word", () => {
  render(
    <VoicesTheme mode="light">
      <StatusDot mood="heated" label="Heated, u/Passw0rd-Is-Tac0" />
    </VoicesTheme>,
  );
  expect(screen.getByRole("img", { name: "Heated, u/Passw0rd-Is-Tac0" })).toBeInTheDocument();
});
