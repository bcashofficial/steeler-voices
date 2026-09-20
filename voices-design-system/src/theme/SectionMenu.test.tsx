import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SectionMenu } from "./SectionMenu";
import { VoicesTheme } from "./VoicesTheme";

test("a dropdown of the five sections with their counts; a pick selects", async () => {
  const onSelect = vi.fn();
  render(
    <VoicesTheme mode="light">
      <SectionMenu
        current="board"
        counts={{ board: 61, document: 2, map: 4212, ab: 3, pipelines: 8 }}
        onSelect={onSelect}
      />
    </VoicesTheme>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Board" }));
  expect(screen.getAllByRole("option")).toHaveLength(5);
  expect(screen.getByRole("option", { name: /Map/ })).toHaveTextContent("4,212");
  await userEvent.click(screen.getByRole("option", { name: /Pipelines/ }));
  expect(onSelect).toHaveBeenCalledWith("pipelines");
});
