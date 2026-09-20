import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { VoiceMessage } from "./VoiceMessage";
import { VoicesTheme } from "./VoicesTheme";

const reading = { mood: "frustrated", yards: 78, who: "u/liquidgrill", sarcasm: true } as const;

test("renders the voice with its pulse and reports its reading on hover", async () => {
  const onFocusReading = vi.fn();
  render(
    <VoicesTheme mode="light">
      <VoiceMessage
        voice={{
          handle: "u/liquidgrill",
          time: "Thu 1:27 PM",
          points: 170,
          body: "An injury that only a bag of money can cure",
        }}
        reading={reading}
        onFocusReading={onFocusReading}
      />
    </VoicesTheme>,
  );
  expect(screen.getByText("u/liquidgrill", { selector: "b" })).toBeInTheDocument();
  expect(screen.getByRole("img", { name: "170" })).toBeInTheDocument();
  expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "78");
  expect(screen.getByRole("img", { name: "read as sarcasm" })).toBeInTheDocument();
  await userEvent.hover(screen.getByRole("article"));
  expect(onFocusReading).toHaveBeenCalledWith(reading);
});

test("a post shows its title and the OP tag; a reply indents", () => {
  render(
    <VoicesTheme mode="light">
      <VoiceMessage
        voice={{
          handle: "u/Stealth_Well_worn",
          op: true,
          time: "Thu 1:16 PM",
          title: "Joey Porter Jr leaves steelers practice",
          body: "",
        }}
        reading={{ mood: "uneasy", yards: 66, who: "u/Stealth_Well_worn" }}
        reply
      />
    </VoicesTheme>,
  );
  expect(screen.getByText("OP")).toBeInTheDocument();
  expect(screen.getByText("Joey Porter Jr leaves steelers practice")).toBeInTheDocument();
  expect(screen.getByRole("article")).toHaveAttribute("data-reply", "true");
});
