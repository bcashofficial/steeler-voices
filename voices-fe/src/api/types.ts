/**
 * The shapes voices-be returns, one per read the app makes. Mood keys are
 * the design system's; times are ISO strings the formatters turn into the
 * platform's "Thu 1:16 PM".
 */

import type { MoodKey } from "design_system/theme";

export interface MoodShare {
  mood: MoodKey;
  share: number;
}

export interface Game {
  opponent: string;
  opponent_abbreviation: string;
  is_home: boolean;
  kickoff_at: string;
  status: string;
  steelers_score: number | null;
  opponent_score: number | null;
}

export interface Week {
  starts_on: string;
  ends_on: string;
  label: string;
  posts: number;
  comments: number;
  games: Game[];
}

export interface WeekDetail {
  week: Week;
  counts: {
    posts: number;
    comments: number;
    subjects: number;
    projected: number;
    documents: number;
    generation_runs: number;
  };
  subjects: { label: string; count: number }[];
}

export interface RailPost {
  voice_id: string;
  title: string;
  handle: string;
  posted_at: string;
  external_url: string;
  score: number | null;
  comments: number;
  captured: number;
  shares: MoodShare[];
}

export interface Reading {
  mood: MoodKey;
  yards: number;
  sarcasm: boolean;
  subjects: string[];
  gist: string;
}

export interface ThreadVoice {
  voice_id: string;
  handle: string;
  posted_at: string;
  score: number | null;
  title: string;
  body: string;
  external_url: string;
  depth: number;
  parent_id: string | null;
  op: boolean;
  reading: Reading | null;
  topic: string | null;
}

export interface Thread {
  post: ThreadVoice;
  voices: ThreadVoice[];
}

export interface MapPoint {
  voice_id: string;
  x: number;
  y: number;
  mood: MoodKey | null;
  topic: string | null;
  text: string;
  retrievals: number;
}

export interface WeekMap {
  points: MapPoint[];
  topics: { label: string; summary: string; size: number; rank: number }[];
  most_retrieved: {
    voice_id: string;
    handle: string;
    text: string;
    external_url: string;
    retrievals: number;
  }[];
}

export interface Citation {
  voice_id: string;
  handle: string;
  external_url: string;
  rank: number;
  distance: number;
  quote: string;
}

export interface DocumentSection {
  kind: string;
  position: number;
  heading: string;
  body: string;
  claims: unknown[];
  citations: Citation[];
}

export interface GenerationRun {
  generation_run_id: string;
  status: "pending" | "running" | "succeeded" | "failed";
  model: string;
  graph_version: string;
  started_at: string | null;
  finished_at: string | null;
  prompt_tokens: number;
  completion_tokens: number;
  retrievals: number;
  error: string;
}

export interface ArmDocument {
  arm: string;
  label: string;
  uses_retrieval: boolean;
  title: string | null;
  is_published: boolean;
  sections: DocumentSection[];
  run: GenerationRun | null;
  outcomes: { metric: string; label: string; unit: string; value: number }[];
}

export interface PipelineRun {
  pipeline_run_id: string;
  pipeline: string;
  host: string;
  dry_run: boolean;
  started_at: string;
  finished_at: string | null;
  exit_code: number | null;
  counts: Record<string, number | string>;
}

export interface Pipeline {
  key: string;
  label: string;
  description: string;
  local_schedule: string;
  remote_schedule: string;
  last_run: PipelineRun | null;
}

export interface Status {
  voices: number;
  embeddings: number;
  projected: number;
  readings: number;
  topics: number;
  weeks: number;
  generation_runs: number;
  documents: number;
}

export interface Vocab {
  sources: { label: string; platform: string; community: string; url: string }[];
}
