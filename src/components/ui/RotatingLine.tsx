"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

export function RotatingLine({
  prefix,
  items,
  interval = 2600,
  override,
}: {
  prefix: string;
  items: string[];
  interval?: number;
  /** When set, shown instead of the rotating `items` — same transition,
   * no separate component. Lets a sibling visual (e.g. the orbital hero)
   * drive this line while the visitor is actively focused on it, without
   * this component needing to know anything about that visual. */
  override?: string | null;
}) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion || override) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, interval);
    return () => clearInterval(id);
  }, [items.length, interval, reduceMotion, override]);

  const displayText = override ?? items[index];

  return (
    <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
      <span className="text-modus">●</span>
      {prefix}
      <AnimatePresence mode="wait">
        <motion.span
          key={displayText}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block whitespace-nowrap text-ink"
        >
          {displayText}
        </motion.span>
      </AnimatePresence>
    </p>
  );
}
