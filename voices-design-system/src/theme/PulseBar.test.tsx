import { render, screen } from "@testing-library/react";

import { PulseBar } from "./PulseBar";
import { filledTicks, tickColor } from "./pulseMath";
import { VoicesTheme } from "./VoicesTheme";

const renderBar = (props: Partial<React.ComponentProps<typeof PulseBar>> = {}) =>
  render(
    <VoicesTheme mode="light">
      <PulseBar mood="uneasy" yards={66} animate={false} {...props} />
    </VoicesTheme>,
  );

test("fills two yards a tick and marks the head", () => {
  renderBar();
  const ticks = document.querySelectorAll(".sv-pulse-tick");
  expect(ticks).toHaveLength(50);
  expect(document.querySelectorAll('.sv-pulse-tick[data-on="true"]')).toHaveLength(33);
  expect(ticks[32]).toHaveAttribute("data-head", "true");
  expect(ticks[33]).toHaveAttribute("data-on", "false");
});

test("is a meter that names its mood and yardage", () => {
  renderBar();
  const meter = screen.getByRole("meter");
  expect(meter).toHaveAttribute("aria-valuenow", "66");
  expect(meter).toHaveAccessibleName("Uneasy");
  expect(screen.getByText("66 yd")).toBeInTheDocument();
});

test("shows the sticker only on a sarcastic voice", () => {
  renderBar({ sarcasm: true });
  expect(screen.getByRole("img", { name: "read as sarcasm" })).toBeInTheDocument();
});

test("every fifth tick is a ten-yard line", () => {
  renderBar();
  const tall = document.querySelectorAll('.sv-pulse-tick[data-tall="true"]');
  expect(tall).toHaveLength(11);
});

test("clamps yardage to the field", () => {
  expect(filledTicks(140, 50)).toBe(50);
  expect(filledTicks(-5, 50)).toBe(0);
});

test("tick color walks the gradient from one stop to the other", () => {
  expect(tickColor("#F5E571", "#697A21", 0, 10)).toBe("color-mix(in srgb, #F5E571 100%, #697A21)");
  expect(tickColor("#F5E571", "#697A21", 9, 10)).toBe("color-mix(in srgb, #F5E571 0%, #697A21)");
});
