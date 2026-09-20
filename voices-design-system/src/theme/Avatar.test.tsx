import { render, screen } from "@testing-library/react";

import { Avatar } from "./Avatar";
import { initialFor, toneFor } from "./avatarTone";
import { VoicesTheme } from "./VoicesTheme";

test("shows the initial after u/ and keeps a stable tone", () => {
  render(
    <VoicesTheme mode="light">
      <Avatar handle="u/swampthingsden" />
    </VoicesTheme>,
  );
  expect(screen.getByRole("img", { name: "u/swampthingsden" })).toHaveTextContent("S");
  expect(toneFor("u/swampthingsden")).toBe(toneFor("u/swampthingsden"));
  expect(initialFor("u/liquidgrill")).toBe("L");
  expect(initialFor("")).toBe("?");
});
