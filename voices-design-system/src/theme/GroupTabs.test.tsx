import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { GroupTabs } from "./GroupTabs";
import { VoicesTheme } from "./VoicesTheme";

test("a dropdown of the three groupings; a pick changes it", async () => {
  const onChange = vi.fn();
  render(
    <VoicesTheme mode="light">
      <GroupTabs value="subject" onChange={onChange} />
    </VoicesTheme>,
  );
  await userEvent.click(screen.getByRole("button", { name: "By subject" }));
  expect(screen.getAllByRole("option")).toHaveLength(3);
  await userEvent.click(screen.getByRole("option", { name: /By mood/ }));
  expect(onChange).toHaveBeenCalledWith("mood");
});
