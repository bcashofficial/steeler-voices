import { fireEvent, render, screen } from "@testing-library/react";

import { Football } from "./Football";
import { VoicesTheme } from "./VoicesTheme";

test("is named for the flyer and calls back on click", () => {
  const onClick = vi.fn();
  render(
    <VoicesTheme mode="light">
      <Football onClick={onClick} />
    </VoicesTheme>,
  );
  const ball = screen.getByRole("button", { name: "Open this week's flyer" });
  fireEvent.click(ball);
  expect(onClick).toHaveBeenCalledTimes(1);
  expect(ball.querySelector("svg")).toHaveAttribute("width", "34");
});
