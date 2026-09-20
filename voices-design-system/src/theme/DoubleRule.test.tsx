import { render, screen } from "@testing-library/react";

import { DoubleRule } from "./DoubleRule";
import { VoicesTheme } from "./VoicesTheme";

test("is a separator six pixels tall", () => {
  render(
    <VoicesTheme mode="light">
      <DoubleRule />
    </VoicesTheme>,
  );
  expect(screen.getByRole("separator")).toHaveStyle({ height: "6px" });
});
