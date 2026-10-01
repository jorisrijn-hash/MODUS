"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, X } from "lucide-react";

/**
 * Validates Section 13's core V2 rule — "prefer morphing over
 * appearing" — with one small, controlled example. State A (a collapsed
 * pill) and State B (an expanded panel) share `layoutId="morph-card"`:
 * Motion animates the shared element's position/size/radius directly
 * between the two states, rather than State A unmounting with its own
 * exit fade while an unrelated State B mounts and fades in independently
 * (the "destroy and re-appear" pattern this rule explicitly rejects).
 * Not `mode="wait"` — see MODUS_REDESIGN_PLAN.md's documented reason
 * that pattern is banned in this project.
 */
export function MorphExample() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex min-h-[220px] items-center justify-center">
      <AnimatePresence initial={false}>
        {!expanded ? (
          <motion.button
            key="collapsed"
            layoutId="morph-card"
            layout
            onClick={() => setExpanded(true)}
            transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
            className="flex items-center gap-2 rounded-full bg-modus px-5 py-2.5 text-[13px] font-medium text-modus-foreground"
          >
            <motion.span layout="position">View the signal</motion.span>
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            layoutId="morph-card"
            layout
            transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
            className="w-full max-w-sm rounded-xl border border-line bg-paper p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <motion.span layout="position" className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
                Signal detected
              </motion.span>
              <button type="button" onClick={() => setExpanded(false)} aria-label="Close">
                <X className="h-4 w-4 text-muted" strokeWidth={1.75} />
              </button>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.2 } }}
              exit={{ opacity: 0 }}
              className="mt-3 text-[14px] leading-relaxed text-graphite"
            >
              This is the same element that was a pill a moment ago — Motion
              morphed its position, size, and radius directly, and this body
              text simply faded in once the shape settled, rather than the
              whole thing disappearing and a new one appearing in its place.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
