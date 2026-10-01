"use client";

import { motion } from "motion/react";
import type { Signal } from "@/lib/diagnostic/types";
import { useDict } from "@/lib/i18n/context";

/**
 * Signal-detection animation: a small datum point appears, a thin line
 * extends, the "SIGNAL / PRELIMINARY" label appears, then the headline
 * reveals. Shares a layoutId with WarpDetail so clicking it "warps" into
 * the full inspection layer instead of opening a plain modal.
 */
export function SignalCard({ signal, onOpen }: { signal: Signal; onOpen: () => void }) {
  const dict = useDict();
  return (
    <motion.button
      type="button"
      layoutId={`signal-${signal.id}`}
      onClick={onOpen}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="block w-full rounded-sm border border-line bg-paper p-4 text-left transition-colors hover:border-modus/50"
    >
      <div className="flex items-center gap-2">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.25, delay: 0.15 }}
          className="h-1.5 w-1.5 shrink-0 rounded-full bg-modus"
        />
        <motion.span
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          style={{ transformOrigin: "left" }}
          className="h-px w-5 bg-modus/40"
        />
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.45 }}
          className="font-mono text-[9px] uppercase tracking-[0.08em] text-modus"
        >
          {dict.signalCard.preliminary}
        </motion.span>
      </div>
      <motion.p
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.6 }}
        className="mt-2 text-[14px] font-medium text-ink"
      >
        {signal.headline}
      </motion.p>
    </motion.button>
  );
}
