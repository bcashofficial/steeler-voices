import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SubjectRow } from "./SubjectRow";
import { VoicesTheme } from "./VoicesTheme";

test("names the subject, draws its count and mix, and reports a press", async () => {
  const onPress = vi.fn();
  render(
    <VoicesTheme mode="light">
      <SubjectRow
        label="Omar Khan"
        count={138}
        shares={[{ mood: "frustrated", share: 0.44 }]}
        pressed
        onPress={onPress}
      />
    </VoicesTheme>,
  );
  const row = screen.getByRole("button", { pressed: true });
  expect(row).toHaveTextContent("Omar Khan");
  expect(screen.getByRole("img", { name: "138" })).toBeInTheDocument();
  expect(screen.getByRole("img", { name: "Omar Khan: Frustrated 44%" })).toBeInTheDocument();
  await userEvent.click(row);
  expect(onPress).toHaveBeenCalled();
});
