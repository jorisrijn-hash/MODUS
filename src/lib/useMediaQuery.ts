"use client";

import { useEffect, useState } from "react";

/**
 * Subscribes to a media query.
 *
 * Starts false and resolves after mount, so server and client render the
 * same markup and nothing hydration-mismatches.
 *
 * Use this — rather than a CSS `hidden` class — to gate anything EXPENSIVE
 * behind a breakpoint. A CSS-hidden component is still mounted: it still
 * creates its WebGL context, still holds GPU memory and still runs its
 * effects. Hiding it only stops you seeing it.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);

  return matches;
}
