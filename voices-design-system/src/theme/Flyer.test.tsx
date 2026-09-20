import { fireEvent, render, screen } from "@testing-library/react";

import { Flyer } from "./Flyer";
import { VoicesTheme } from "./VoicesTheme";

const props = {
  game: { away: "Steelers", home: "Patriots" },
  counts: { posts: 61, comments: 4212, subjects: 7 },
  subjects: [
    { label: "Joey Porter Jr.", count: 1204 },
    { label: "Omar Khan", count: 318 },
  ],
};

test("is a dialog named for the product with the matchup, the counts and the subjects", () => {
  render(
    <VoicesTheme mode="light">
      <Flyer open onClose={() => {}} {...props} />
    </VoicesTheme>,
  );
  const dialog = screen.getByRole("dialog", { name: "Steeler Voices" });
  expect(dialog).toHaveAttribute("aria-modal", "true");
  expect(dialog).toHaveTextContent("Steelers at Patriots");
  expect(screen.getByText("Posts")).toBeInTheDocument();
  expect(screen.getByText("Joey Porter Jr.")).toBeInTheDocument();
  expect(screen.getByText("1,204")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Open the board" })).toHaveFocus();
});

test("closes on the link, the scrim and Escape; renders nothing when shut", () => {
  const onClose = vi.fn();
  const { container, rerender } = render(
    <VoicesTheme mode="light">
      <Flyer open onClose={onClose} {...props} />
    </VoicesTheme>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Open the board" }));
  fireEvent.click(container.querySelector(".sv-flyer-scrim")!);
  fireEvent.click(screen.getByRole("dialog"));
  fireEvent.keyDown(document, { key: "Escape" });
  expect(onClose).toHaveBeenCalledTimes(3);
  rerender(
    <VoicesTheme mode="light">
      <Flyer open={false} onClose={onClose} {...props} />
    </VoicesTheme>,
  );
  expect(screen.queryByRole("dialog")).toBeNull();
});

test("a bye week has no matchup line", () => {
  render(
    <VoicesTheme mode="light">
      <Flyer open onClose={() => {}} {...props} game={null} />
    </VoicesTheme>,
  );
  expect(screen.getByRole("dialog")).not.toHaveTextContent(" at ");
  expect(screen.getByText("Posts")).toBeInTheDocument();
});
