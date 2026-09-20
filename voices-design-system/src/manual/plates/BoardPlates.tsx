import { useState } from "react";

import {
  Avatar,
  GroupTabs,
  Pane,
  Scoreboard,
  SubjectRow,
  TextLink,
  VoiceMessage,
  WORDS,
  type GroupingKey,
  type Reading,
  type Voice,
} from "../../theme";
import { Figure } from "./shared";

export function TextLinkPlate() {
  const [current, setCurrent] = useState("board");
  return (
    <div style={{ display: "grid", gap: 28 }}>
      <Figure label="Anchor">
        <div style={{ display: "flex", gap: 8 }}>
          <TextLink href="#text-link">Board</TextLink>
          <TextLink href="#text-link">Document</TextLink>
          <TextLink href="#text-link">Map</TextLink>
        </div>
      </Figure>
      <Figure label="Current">
        <div style={{ display: "flex", gap: 8 }}>
          {["board", "document", "map"].map((key) => (
            <TextLink key={key} current={current === key} onClick={() => setCurrent(key)}>
              {key === "board" ? "Board" : key === "document" ? "Document" : "Map"}
            </TextLink>
          ))}
        </div>
      </Figure>
      <Figure label="sm">
        <TextLink size="sm">{WORDS.openBoard}</TextLink>
      </Figure>
    </div>
  );
}

const HANDLES = [
  "u/Stealth_Well_worn",
  "u/swampthingsden",
  "u/liquidgrill",
  "u/RudolphsJockStrap",
  "u/ecg_tsp",
  "u/Passw0rd-Is-Tac0",
  "u/DaRealSphonx",
  "u/SlyCooper007",
];

export function AvatarPlate() {
  return (
    <div style={{ display: "grid", gap: 28 }}>
      <Figure label="34">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {HANDLES.map((handle) => (
            <Avatar key={handle} handle={handle} />
          ))}
        </div>
      </Figure>
      <Figure label="Sizes">
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <Avatar handle="u/swampthingsden" size={24} />
          <Avatar handle="u/swampthingsden" size={34} />
          <Avatar handle="u/swampthingsden" size={56} />
        </div>
      </Figure>
    </div>
  );
}

interface ThreadVoice {
  voice: Voice;
  reading: Reading;
  reply?: boolean;
}

const THREAD: ThreadVoice[] = [
  {
    voice: {
      handle: "u/Stealth_Well_worn",
      op: true,
      time: "Thu 1:16 PM",
      points: 1900,
      title: "Joey Porter Jr leaves steelers practice",
      body: "",
    },
    reading: { mood: "uneasy", yards: 66, who: "u/Stealth_Well_worn" },
  },
  {
    voice: {
      handle: "u/swampthingsden",
      time: "Thu 1:19 PM",
      points: 313,
      body: "Really can’t believe it got to this point.",
    },
    reading: { mood: "uneasy", yards: 54, who: "u/swampthingsden" },
  },
  {
    voice: {
      handle: "u/liquidgrill",
      time: "Thu 1:27 PM",
      points: 170,
      body: "An “injury” that only a bag of money can cure",
    },
    reading: { mood: "frustrated", yards: 78, who: "u/liquidgrill", sarcasm: true },
  },
  {
    voice: {
      handle: "u/Stealth_Well_worn",
      op: true,
      time: "Thu 1:30 PM",
      points: 24,
      body: "Yeah agreed we pay him his back will magically heal.",
    },
    reading: { mood: "frustrated", yards: 61, who: "u/Stealth_Well_worn", sarcasm: true },
    reply: true,
  },
  {
    voice: {
      handle: "u/RudolphsJockStrap",
      time: "Thu 1:21 PM",
      points: 137,
      body: "Genuinely frustrating to see some of the contracts we have handed out but won’t pay him.",
    },
    reading: { mood: "frustrated", yards: 83, who: "u/RudolphsJockStrap" },
  },
  {
    voice: {
      handle: "u/swampthingsden",
      time: "Thu 1:24 PM",
      points: 87,
      body: "They gave out some fair contracts this offseason. I doubt they did not offer Porter a fair contract as well.",
    },
    reading: { mood: "level", yards: 38, who: "u/swampthingsden" },
    reply: true,
  },
  {
    voice: {
      handle: "u/Passw0rd-Is-Tac0",
      time: "Thu 1:19 PM",
      points: 61,
      body: "Faking another injury I see. He’s gonna milk this and we know the Steelers don’t negotiate in season so I personally don’t see Joey playing for the Steelers again.",
    },
    reading: { mood: "heated", yards: 91, who: "u/Passw0rd-Is-Tac0" },
  },
];

export function VoiceMessagePlate() {
  const [current, setCurrent] = useState<Reading | null>(null);
  return (
    <div style={{ display: "grid", gap: 20, maxWidth: 720 }}>
      <Scoreboard resting={THREAD[0].reading} current={current} />
      <div style={{ display: "grid", gap: 2 }} onMouseLeave={() => setCurrent(null)}>
        {THREAD.map((entry, index) => (
          <VoiceMessage
            key={index}
            voice={entry.voice}
            reading={entry.reading}
            reply={entry.reply}
            onFocusReading={setCurrent}
          />
        ))}
      </div>
    </div>
  );
}

export function PanePlate() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 20, minHeight: 240 }}>
      <Pane
        bar={{ title: `${WORDS.thread} — Joey Porter Jr leaves steelers practice`, count: 601 }}
      >
        <VoiceMessage voice={THREAD[1].voice} reading={THREAD[1].reading} />
        <VoiceMessage voice={THREAD[2].voice} reading={THREAD[2].reading} />
      </Pane>
      <Pane>
        <SubjectRowPlateRows />
      </Pane>
    </div>
  );
}

export function GroupTabsPlate() {
  const [value, setValue] = useState<GroupingKey>("subject");
  return <GroupTabs value={value} onChange={setValue} />;
}

const SUBJECTS = [
  {
    label: "Joey Porter Jr.",
    count: 412,
    shares: [
      { mood: "heated", share: 0.31 },
      { mood: "frustrated", share: 0.27 },
      { mood: "uneasy", share: 0.22 },
      { mood: "level", share: 0.14 },
      { mood: "hopeful", share: 0.06 },
    ],
  },
  {
    label: "Omar Khan",
    count: 138,
    shares: [
      { mood: "frustrated", share: 0.44 },
      { mood: "level", share: 0.3 },
      { mood: "heated", share: 0.16 },
      { mood: "proud", share: 0.1 },
    ],
  },
  {
    label: "Le’Veon Bell",
    count: 57,
    shares: [
      { mood: "frustrated", share: 0.52 },
      { mood: "heated", share: 0.28 },
      { mood: "level", share: 0.2 },
    ],
  },
  {
    label: "The front office",
    count: 49,
    shares: [
      { mood: "level", share: 0.46 },
      { mood: "frustrated", share: 0.34 },
      { mood: "proud", share: 0.2 },
    ],
  },
  {
    label: "DK Metcalf",
    count: 33,
    shares: [
      { mood: "heated", share: 0.4 },
      { mood: "uneasy", share: 0.35 },
      { mood: "level", share: 0.25 },
    ],
  },
  {
    label: "Mike McCarthy",
    count: 28,
    shares: [
      { mood: "level", share: 0.58 },
      { mood: "hopeful", share: 0.24 },
      { mood: "uneasy", share: 0.18 },
    ],
  },
  {
    label: "The refs",
    count: 11,
    shares: [
      { mood: "frustrated", share: 0.7 },
      { mood: "heated", share: 0.3 },
    ],
  },
] as const;

function SubjectRowPlateRows() {
  const [pressed, setPressed] = useState<string | null>("Joey Porter Jr.");
  return (
    <div style={{ display: "grid", gap: 0 }}>
      {SUBJECTS.map((subject) => (
        <SubjectRow
          key={subject.label}
          label={subject.label}
          count={subject.count}
          shares={subject.shares}
          pressed={pressed === subject.label}
          onPress={() => setPressed(pressed === subject.label ? null : subject.label)}
        />
      ))}
    </div>
  );
}

export function SubjectRowPlate() {
  return (
    <div style={{ maxWidth: 420 }}>
      <SubjectRowPlateRows />
    </div>
  );
}
