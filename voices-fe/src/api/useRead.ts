/**
 * useRead — one read, kept in state: loading until it lands, the data once
 * it has, the error if it failed. A null path reads nothing. Changing the
 * path aborts the read in flight and starts the next.
 */

import { useEffect, useState } from "react";

import { read } from "./client";

export interface ReadState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export function useRead<T>(path: string | null): ReadState<T> {
  const [state, setState] = useState<ReadState<T>>({
    data: null,
    error: null,
    loading: path !== null,
  });

  useEffect(() => {
    if (path === null) {
      setState({ data: null, error: null, loading: false });
      return;
    }
    const controller = new AbortController();
    setState((previous) => ({ ...previous, loading: true, error: null }));
    read<T>(path, controller.signal)
      .then((data) => setState({ data, error: null, loading: false }))
      .catch((error: Error) => {
        if (error.name !== "AbortError")
          setState({ data: null, error: error.message, loading: false });
      });
    return () => controller.abort();
  }, [path]);

  return state;
}
