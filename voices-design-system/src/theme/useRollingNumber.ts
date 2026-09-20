import { useEffect, useRef, useState } from "react";

import { prefersReducedMotion } from "./styles";

/** A number that rolls to its target like a scoreboard — 420ms, ease-out
 *  cubic — and jumps straight there under reduced motion. */
export function useRollingNumber(target: number, durationMs = 420): number {
  const [shown, setShown] = useState(target);
  const frame = useRef<number>(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setShown(target);
      return;
    }
    const from = shown;
    const started = performance.now();
    const step = (now: number) => {
      const linear = Math.min(1, (now - started) / durationMs);
      const eased = 1 - Math.pow(1 - linear, 3);
      setShown(Math.round(from + (target - from) * eased));
      if (linear < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
    // `shown` is the roll's starting point, deliberately read once per target.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs]);

  return shown;
}
