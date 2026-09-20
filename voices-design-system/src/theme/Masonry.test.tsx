import { render, screen } from "@testing-library/react";

import { Masonry } from "./Masonry";
import { VoicesTheme } from "./VoicesTheme";

test("lays its children out in columns and mounts its style once", () => {
  render(
    <VoicesTheme mode="light">
      <Masonry>
        <article>601</article>
        <article>276</article>
      </Masonry>
      <Masonry column={160}>
        <article>252</article>
      </Masonry>
    </VoicesTheme>,
  );
  expect(screen.getByText("601").parentElement).toHaveClass("sv-masonry");
  expect(screen.getByText("252").parentElement).toHaveStyle({ "--sv-masonry-column": "160px" });
  expect(document.querySelectorAll("#sv-masonry")).toHaveLength(1);
});
