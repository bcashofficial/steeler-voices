import { fireEvent, render, screen } from "@testing-library/react";

import { PostCard, type Post } from "./PostCard";
import { VoicesTheme } from "./VoicesTheme";

const post: Post = {
  title: "Joey Porter Jr leaves steelers practice",
  who: "u/Stealth_Well_worn",
  when: "Thu 1:16 PM",
  media: "photo",
};
const shares = [
  { mood: "heated", share: 0.31 },
  { mood: "frustrated", share: 0.27 },
  { mood: "uneasy", share: 0.22 },
  { mood: "level", share: 0.14 },
  { mood: "hopeful", share: 0.06 },
] as const;

test("draws the count, the tag, the title and the loudest mood", () => {
  render(
    <VoicesTheme mode="light">
      <PostCard post={post} count={601} shares={shares} selected />
    </VoicesTheme>,
  );
  expect(screen.getByRole("img", { name: "601" })).toBeInTheDocument();
  expect(screen.getByText("Photo")).toBeInTheDocument();
  expect(screen.getByText(post.title)).toBeInTheDocument();
  expect(screen.getByText(post.who)).toBeInTheDocument();
  expect(screen.getByRole("img", { name: "Heated" })).toHaveAttribute("data-mood", "heated");
  expect(screen.getByRole("article")).toHaveAttribute("aria-current", "true");
  expect(screen.getByRole("article")).toHaveAttribute("data-mood", "heated");
});

test("selects on click, Enter and Space", () => {
  const onSelect = vi.fn();
  render(
    <VoicesTheme mode="light">
      <PostCard post={{ ...post, media: "link" }} count={252} shares={shares} onSelect={onSelect} />
    </VoicesTheme>,
  );
  const card = screen.getByRole("article");
  expect(card).not.toHaveAttribute("aria-current");
  expect(screen.getByText("Link")).toBeInTheDocument();
  fireEvent.click(card);
  fireEvent.keyDown(card, { key: "Enter" });
  fireEvent.keyDown(card, { key: " " });
  fireEvent.keyDown(card, { key: "a" });
  expect(onSelect).toHaveBeenCalledTimes(3);
});

test("sits the image under the halftone when the post has one", () => {
  const { container } = render(
    <VoicesTheme mode="light">
      <PostCard post={{ ...post, image: "cover.jpg" }} count={601} shares={shares} />
    </VoicesTheme>,
  );
  const img = container.querySelector(".sv-postcard-cover > img");
  expect(img).toHaveAttribute("src", "cover.jpg");
  expect(img).toHaveAttribute("alt", "");
});

test("a thread no reading has reached makes no claim: no mood, no dot, no lanes", () => {
  render(
    <VoicesTheme mode="light">
      <PostCard post={post} count={601} shares={[]} />
    </VoicesTheme>,
  );
  expect(screen.getByRole("article")).not.toHaveAttribute("data-mood");
  expect(screen.queryByRole("img", { name: "Heated" })).toBeNull();
  expect(screen.getByRole("img", { name: "601" })).toBeInTheDocument();
});
