import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BASE_STYLE_ID } from "./cssVariables";
import { FONT_FACE_STYLE_ID } from "./fonts";
import { GROUND_STYLE_ID } from "./ground";
import { THEME_STORAGE_KEY, VoicesTheme } from "./VoicesTheme";
import { useVoicesTheme } from "./VoicesThemeContext";

function Probe() {
  const { mode, toggle } = useVoicesTheme();
  return (
    <button type="button" onClick={toggle}>
      {mode}
    </button>
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

test("mounts fonts, variables and grounds once, and stamps the mode on the root", () => {
  render(
    <VoicesTheme mode="light">
      <Probe />
    </VoicesTheme>,
  );
  expect(document.getElementById(FONT_FACE_STYLE_ID)).not.toBeNull();
  expect(document.getElementById(BASE_STYLE_ID)).not.toBeNull();
  expect(document.getElementById(GROUND_STYLE_ID)).not.toBeNull();
  expect(document.documentElement.getAttribute("data-theme")).toBe("light");
});

test("toggle flips the mode, restamps the root and remembers the choice", async () => {
  render(
    <VoicesTheme mode="light">
      <Probe />
    </VoicesTheme>,
  );
  await act(async () => {
    await userEvent.click(screen.getByRole("button"));
  });
  expect(screen.getByRole("button")).toHaveTextContent("dark");
  expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
});
