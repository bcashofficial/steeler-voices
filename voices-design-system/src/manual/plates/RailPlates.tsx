import { useState } from "react";

import { Masonry, MOODS, PostCard, StatusDot, typography, type Post } from "../../theme";
import { Figure } from "./shared";

interface RailPost {
  post: Post;
  count: number;
  shares: { mood: (typeof MOODS)[number]["key"]; share: number }[];
  cover: number;
}

/** The week's posts as the sheet has them, in rail order. */
const POSTS: RailPost[] = [
  {
    post: {
      title: "Joey Porter Jr leaves steelers practice",
      who: "u/Stealth_Well_worn",
      when: "Thu 1:16 PM",
      media: "photo",
    },
    count: 601,
    cover: 132,
    shares: [
      { mood: "heated", share: 0.31 },
      { mood: "frustrated", share: 0.27 },
      { mood: "uneasy", share: 0.22 },
      { mood: "level", share: 0.14 },
      { mood: "hopeful", share: 0.06 },
    ],
  },
  {
    post: {
      title: "Rapoport on the McAfee show confirms the Steelers are shopping JPJ",
      who: "u/BAMBAMBAKLAVA11",
      when: "Tue 12:52 PM",
    },
    count: 276,
    cover: 96,
    shares: [
      { mood: "level", share: 0.38 },
      { mood: "frustrated", share: 0.3 },
      { mood: "uneasy", share: 0.32 },
    ],
  },
  {
    post: {
      title: "Inside the saga around Joey Porter Jr.’s future with Steelers — ESPN",
      who: "u/Stealth_Well_worn",
      when: "Fri 10:06 AM",
      media: "link",
    },
    count: 252,
    cover: 110,
    shares: [
      { mood: "heated", share: 0.35 },
      { mood: "frustrated", share: 0.4 },
      { mood: "level", share: 0.25 },
    ],
  },
  {
    post: {
      title: "NFL YouTube channel predictors are 9-1 in favor of the Patriots this week",
      who: "u/DizEthan414",
      when: "Wed 5:39 PM",
      media: "photo",
    },
    count: 171,
    cover: 88,
    shares: [
      { mood: "hyped", share: 0.44 },
      { mood: "hopeful", share: 0.3 },
      { mood: "uneasy", share: 0.26 },
    ],
  },
  {
    post: {
      title: "How many CBs are better than JPJ, now or going forward?",
      who: "u/WinesburgOhio",
      when: "Fri 7:46 AM",
    },
    count: 170,
    cover: 120,
    shares: [
      { mood: "level", share: 0.52 },
      { mood: "proud", share: 0.28 },
      { mood: "uneasy", share: 0.2 },
    ],
  },
  {
    post: {
      title: "Porter out, Pittman and Fautanu questionable for Patriots",
      who: "u/patrick66",
      when: "Fri 3:40 PM",
      media: "photo",
    },
    count: 115,
    cover: 84,
    shares: [
      { mood: "uneasy", share: 0.58 },
      { mood: "level", share: 0.42 },
    ],
  },
  {
    post: {
      title: "Aaron Rodgers is one win away from tying Ben Roethlisberger for 5th…",
      who: "u/pfref",
      when: "Thu 11:56 AM",
      media: "photo",
    },
    count: 104,
    cover: 104,
    shares: [
      { mood: "proud", share: 0.5 },
      { mood: "hyped", share: 0.32 },
      { mood: "level", share: 0.18 },
    ],
  },
];

/** A stand-in photograph: the leather, drawn, so the plate needs no network. */
const LEATHER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5a3b1e"/><stop offset="1" stop-color="#2c1a0c"/></linearGradient><pattern id="p" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="2.2" fill="#000" fill-opacity=".22"/></pattern></defs><rect width="400" height="260" fill="url(#g)"/><rect width="400" height="260" fill="url(#p)"/></svg>`,
  );

export function PostCardPlate() {
  const [selected, setSelected] = useState(0);
  const [first, second, third] = POSTS;
  const card = (entry: RailPost, index: number, post: Post = entry.post) => (
    <PostCard
      post={post}
      count={entry.count}
      shares={entry.shares}
      coverHeight={entry.cover}
      selected={selected === index}
      onSelect={() => setSelected(index)}
    />
  );
  return (
    <div style={{ display: "grid", gap: 28 }}>
      <Figure label="Plate">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, 200px)", gap: 12 }}>
          {card(first, 0)}
          {card(second, 1)}
          {card(third, 2)}
        </div>
      </Figure>
      <Figure label="Image">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, 200px)", gap: 12 }}>
          {card(first, 3, { ...first.post, image: LEATHER })}
        </div>
      </Figure>
    </div>
  );
}

export function MasonryPlate() {
  const [selected, setSelected] = useState(0);
  return (
    <Figure label="The rail">
      <div style={{ maxWidth: 412 }}>
        <Masonry>
          {POSTS.map((entry, index) => (
            <PostCard
              key={entry.post.title}
              post={entry.post}
              count={entry.count}
              shares={entry.shares}
              coverHeight={entry.cover}
              selected={selected === index}
              onSelect={() => setSelected(index)}
            />
          ))}
        </Masonry>
      </div>
    </Figure>
  );
}

export function StatusDotPlate() {
  return (
    <Figure label="Moods">
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 24px" }}>
        {MOODS.map((mood) => (
          <span
            key={mood.key}
            style={{
              display: "inline-flex",
              alignItems: "baseline",
              gap: 8,
              fontFamily: typography.body,
              fontSize: 13.5,
              fontWeight: 600,
              lineHeight: 1.3,
            }}
          >
            <span>{mood.label}</span>
            <StatusDot mood={mood.key} />
          </span>
        ))}
      </div>
    </Figure>
  );
}
