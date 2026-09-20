/**
 * The one door to voices-be. The base URL is fixed at build time
 * (VITE_BACKEND_URL); a read is a GET that resolves to JSON or throws
 * with the status in the message.
 */

export const BACKEND_URL =
  (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? "http://localhost:8300";

export async function read<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${BACKEND_URL}${path}`, { signal });
  if (!response.ok) throw new Error(`${response.status} ${path}`);
  return (await response.json()) as T;
}

export const paths = {
  status: "/api/status/",
  vocab: "/api/vocab/",
  weeks: "/api/weeks/",
  week: (startsOn: string) => `/api/weeks/${startsOn}/`,
  posts: (startsOn: string) => `/api/weeks/${startsOn}/posts/`,
  map: (startsOn: string) => `/api/weeks/${startsOn}/map/`,
  documents: (startsOn: string) => `/api/weeks/${startsOn}/documents/`,
  thread: (voiceId: string) => `/api/threads/${voiceId}/`,
  pipelines: "/api/pipelines/",
} as const;
