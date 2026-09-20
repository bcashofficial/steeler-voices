import { render, screen } from "@testing-library/react";

import { Scoreboard, type Reading } from "./Scoreboard";
import { VoicesTheme } from "./VoicesTheme";

const post: Reading = { mood: "uneasy", yards: 66, who: "u/Stealth_Well_worn" };
const comment: Reading = { mood: "heated", yards: 91, who: "u/Passw0rd-Is-Tac0", sarcasm: true };

test("rests on the post's reading and lights its swatch", () => {
  render(
    <VoicesTheme mode="light">
      <Scoreboard resting={post} />
    </VoicesTheme>,
  );
  expect(screen.getByText("u/Stealth_Well_worn")).toBeInTheDocument();
  expect(screen.getByText("Uneasy", { selector: "b" })).toBeInTheDocument();
  expect(document.querySelector('[data-mood="uneasy"][data-on="true"]')).not.toBeNull();
  expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "66");
});

test("plays the current reading when one is passed", () => {
  const { rerender } = render(
    <VoicesTheme mode="light">
      <Scoreboard resting={post} />
    </VoicesTheme>,
  );
  rerender(
    <VoicesTheme mode="light">
      <Scoreboard resting={post} current={comment} />
    </VoicesTheme>,
  );
  expect(screen.getByText("u/Passw0rd-Is-Tac0")).toBeInTheDocument();
  expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "91");
  expect(document.querySelector('[data-mood="heated"][data-on="true"]')).not.toBeNull();
});
