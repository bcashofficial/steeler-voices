import { render, screen } from "@testing-library/react";

import { Pane } from "./Pane";
import { VoicesTheme } from "./VoicesTheme";

test("shows its bar with a drawn count and its children", () => {
  render(
    <VoicesTheme mode="light">
      <Pane bar={{ title: "Thread", count: 601 }}>
        <p>a voice</p>
      </Pane>
    </VoicesTheme>,
  );
  expect(screen.getByText("Thread")).toBeInTheDocument();
  expect(screen.getByRole("img", { name: "601" })).toBeInTheDocument();
  expect(screen.getByText("a voice")).toBeInTheDocument();
});
