import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Dropdown } from "./Dropdown";
import { VoicesTheme } from "./VoicesTheme";

const options = [
  { key: "board", label: "Board", count: 61 },
  { key: "document", label: "Document", count: 2 },
  { key: "map", label: "Map", count: 4212 },
];

test("shows the current choice, opens to a listbox, and picks by click", async () => {
  const onChange = vi.fn();
  render(
    <VoicesTheme mode="light">
      <Dropdown options={options} value="board" onChange={onChange} />
    </VoicesTheme>,
  );
  const field = screen.getByRole("button", { name: "Board" });
  expect(field).toHaveAttribute("aria-expanded", "false");
  await userEvent.click(field);
  expect(screen.getByRole("listbox")).toBeInTheDocument();
  expect(screen.getByRole("option", { name: /Board/ })).toHaveAttribute("aria-selected", "true");
  expect(screen.getByRole("img", { name: "4,212" })).toBeInTheDocument();
  await userEvent.click(screen.getByRole("option", { name: /Map/ }));
  expect(onChange).toHaveBeenCalledWith("map");
  expect(screen.queryByRole("listbox")).toBeNull();
});

test("arrows move and Enter picks; Escape closes", async () => {
  const onChange = vi.fn();
  render(
    <VoicesTheme mode="light">
      <Dropdown options={options} value="board" onChange={onChange} label="Section" />
    </VoicesTheme>,
  );
  const field = screen.getByRole("button");
  field.focus();
  await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
  expect(onChange).toHaveBeenCalledWith("document");
  await userEvent.keyboard("{ArrowDown}{Escape}");
  expect(screen.queryByRole("listbox")).toBeNull();
});

test("shows the placeholder when nothing is chosen", () => {
  render(
    <VoicesTheme mode="light">
      <Dropdown options={options} value={null} onChange={() => {}} placeholder="Board" />
    </VoicesTheme>,
  );
  expect(screen.getByRole("button")).toHaveAttribute("data-empty", "true");
});
