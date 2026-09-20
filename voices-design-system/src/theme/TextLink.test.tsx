import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TextLink } from "./TextLink";
import { VoicesTheme } from "./VoicesTheme";

test("is an anchor with an href and a button without", async () => {
  const onClick = vi.fn();
  render(
    <VoicesTheme mode="light">
      <TextLink href="#board">Board</TextLink>
      <TextLink onClick={onClick}>Document</TextLink>
    </VoicesTheme>,
  );
  expect(screen.getByRole("link", { name: "Board" })).toHaveAttribute("href", "#board");
  await userEvent.click(screen.getByRole("button", { name: "Document" }));
  expect(onClick).toHaveBeenCalled();
});

test("current marks the page", () => {
  render(
    <VoicesTheme mode="light">
      <TextLink current>Board</TextLink>
    </VoicesTheme>,
  );
  expect(screen.getByRole("button", { name: "Board" })).toHaveAttribute("aria-current", "page");
});
