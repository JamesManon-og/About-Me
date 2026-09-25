"use client";

import { useCallback, useEffect, useRef } from "react";

/** How close to the bottom, in pixels, still counts as "at the bottom". */
const THRESHOLD = 80;

/**
 * Keeps the page scrolled to the newest message while an answer streams, unless the
 * visitor has scrolled up to read. `pin()` re-attaches, for example after sending.
 */
export function useStickToBottom(trigger: unknown) {
  const pinned = useRef(true);

  useEffect(() => {
    const onScroll = () => {
      const { scrollHeight } = document.documentElement;
      pinned.current =
        scrollHeight - (window.scrollY + window.innerHeight) < THRESHOLD;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (pinned.current) {
      window.scrollTo({ top: document.documentElement.scrollHeight });
    }
  }, [trigger]);

  return useCallback(() => {
    pinned.current = true;
  }, []);
}
