import { render, screen } from "@testing-library/react";

import { formatCount } from "./format";
import { Numeral } from "./Numeral";
import { VoicesTheme } from "./VoicesTheme";

test("separates thousands and shows its caption", () => {
  render(
    <VoicesTheme mode="light">
      <Numeral value={4212} caption="Comments" />
    </VoicesTheme>,
  );
  expect(screen.getByRole("img", { name: "4,212" })).toBeInTheDocument();
  expect(screen.getByText("Comments")).toBeInTheDocument();
});

test("formatCount rounds and groups", () => {
  expect(formatCount(600.6)).toBe("601");
  expect(formatCount(1234567)).toBe("1,234,567");
});
