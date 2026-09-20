import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { GroupTabs } from "./GroupTabs";
import { VoicesTheme } from "./VoicesTheme";

test("three tabs from the vocab; the selected one is marked and a click changes it", async () => {
  const onChange = vi.fn();
  render(
    <VoicesTheme mode="light">
      <GroupTabs value="subject" onChange={onChange} />
    </VoicesTheme>,
  );
  expect(screen.getAllByRole("tab")).toHaveLength(3);
  expect(screen.getByRole("tab", { name: "By subject" })).toHaveAttribute("aria-selected", "true");
  await userEvent.click(screen.getByRole("tab", { name: "By mood" }));
  expect(onChange).toHaveBeenCalledWith("mood");
});
