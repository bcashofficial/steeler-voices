import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { VoicesTheme } from "design_system/theme";

import type { RailPost, Thread } from "../api/types";
import { Board } from "./Board";

const WEEK = {
  starts_on: "2026-09-15",
  ends_on: "2026-09-21",
  label: "week of Sep 15",
  posts: 2,
  comments: 3,
  games: [],
};

const POSTS: RailPost[] = [
  {
    voice_id: "p1",
    title: "Joey Porter Jr leaves steelers practice",
    handle: "Stealth_Well_worn",
    posted_at: "2026-09-17T17:16:59Z",
    external_url: "https://www.reddit.com/r/steelers/comments/1wj04z1/",
    score: 439,
    comments: 601,
    captured: 2,
    shares: [{ mood: "heated", share: 1 }],
  },
  {
    voice_id: "p2",
    title: "Watt my beloved",
    handle: "pfref",
    posted_at: "2026-09-17T15:56:00Z",
    external_url: "https://www.reddit.com/r/steelers/comments/1wh61bt/",
    score: 685,
    comments: 41,
    captured: 0,
    shares: [],
  },
];

const THREAD: Thread = {
  post: {
    voice_id: "p1",
    handle: "Stealth_Well_worn",
    posted_at: "2026-09-17T17:16:59Z",
    score: 439,
    title: "Joey Porter Jr leaves steelers practice",
    body: "",
    external_url: "",
    depth: 0,
    parent_id: null,
    op: true,
    reading: { mood: "uneasy", yards: 66, sarcasm: false, subjects: ["Joey Porter Jr."], gist: "" },
    topic: null,
  },
  voices: [
    {
      voice_id: "c1",
      handle: "liquidgrill",
      posted_at: "2026-09-17T17:27:00Z",
      score: 170,
      title: "",
      body: "An injury that only a bag of money can cure",
      external_url: "",
      depth: 1,
      parent_id: "p1",
      op: false,
      reading: {
        mood: "frustrated",
        yards: 78,
        sarcasm: true,
        subjects: ["Joey Porter Jr."],
        gist: "",
      },
      topic: null,
    },
    {
      voice_id: "c2",
      handle: "ecg_tsp",
      posted_at: "2026-09-17T17:21:00Z",
      score: 20,
      title: "",
      body: "How do you know they don't want to pay him.",
      external_url: "",
      depth: 2,
      parent_id: "c1",
      op: false,
      reading: null,
      topic: null,
    },
  ],
};

const responses: Record<string, unknown> = {
  "/api/weeks/2026-09-15/posts/": { posts: POSTS },
  "/api/threads/p1/": THREAD,
  "/api/threads/p2/": {
    post: { ...THREAD.post, voice_id: "p2", title: "Watt my beloved" },
    voices: [],
  },
};

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string) => {
      const path = url.replace("http://localhost:8300", "");
      const body = responses[path];
      return Promise.resolve({
        ok: body !== undefined,
        status: body ? 200 : 404,
        json: async () => body,
      });
    }),
  );
});

afterEach(() => vi.unstubAllGlobals());

test("opens the first post's thread, groups its readings, and turns to another card", async () => {
  render(
    <VoicesTheme mode="light">
      <Board week={WEEK} platform="reddit" />
    </VoicesTheme>,
  );
  await waitFor(() =>
    expect(
      screen.getByText("Thread — Joey Porter Jr leaves steelers practice"),
    ).toBeInTheDocument(),
  );
  expect(screen.getAllByText("u/Stealth_Well_worn").length).toBeGreaterThan(0);
  expect(screen.getByText("An injury that only a bag of money can cure")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Joey Porter Jr\./ })).toHaveTextContent(
    "Joey Porter Jr.",
  );
  expect(screen.getAllByRole("article")).toHaveLength(3 + 2); // three voices, two cards
  const replies = document.querySelectorAll('.sv-voice[data-reply="true"]');
  expect(replies).toHaveLength(1);
  expect(replies[0]).toHaveTextContent("How do you know");

  await userEvent.click(screen.getByText("Watt my beloved"));
  await waitFor(() => expect(screen.getByText("Thread — Watt my beloved")).toBeInTheDocument());
});

test("a pressed row keeps only its voices in the thread", async () => {
  render(
    <VoicesTheme mode="light">
      <Board week={WEEK} platform="reddit" />
    </VoicesTheme>,
  );
  const row = await screen.findByRole("button", { name: /Joey Porter Jr\./ });
  await userEvent.click(row);
  expect(row).toHaveAttribute("aria-pressed", "true");
  expect(screen.queryByText("How do you know they don't want to pay him.")).toBeNull();
  expect(screen.getByText("An injury that only a bag of money can cure")).toBeInTheDocument();
});
