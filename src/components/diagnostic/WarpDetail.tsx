"use client";

import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import type { Signal } from "@/lib/diagnostic/types";
import { useDict } from "@/lib/i18n/context";

/**
 * Shared-layout "warp" expansion: the card the user clicked grows into a
 * full detail layer via a matching layoutId, rather than a plain modal
 * fade, meant to feel like zooming into the business, not opening a popup.
 */
export function WarpDetail({
  signal,
  onClose,
}: {
  signal: Signal | null;
  onClose: () => void;
}) {
  const dict = useDict();
  const t = dict.diagnosticWarpDetail;
  return (
    <AnimatePresence>
      {signal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-ink/40 backdrop-blur-[2px]"
          />
          <motion.div
            layoutId={`signal-${signal.id}`}
            transition={{ type: "spring", stiffness: 340, damping: 32, mass: 0.9 }}
            className="fixed inset-x-4 top-1/2 z-[81] max-w-xl -translate-y-1/2 rounded-md border border-line bg-paper shadow-2xl sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-modus">
                {t.label}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label={t.close}
                className="flex h-8 w-8 items-center justify-center text-muted hover:text-ink"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            <div className="px-6 py-6">
              <h3 className="text-xl font-semibold text-ink">{signal.headline}</h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-graphite">{signal.body}</p>

              <div className="mt-5 border-t border-line pt-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
                  {t.whyThisMatters}
                </p>
                <p className="mt-2 text-[14px] leading-relaxed text-graphite">{signal.why}</p>
              </div>

              <div className="mt-5 border-t border-line pt-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
                  {t.whatModusWouldInspect}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {signal.inspect.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[14px] text-graphite">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-modus" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 rounded-sm border border-modus/30 bg-modus/5 p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-modus">
                  {t.possibleIntervention}
                </p>
                <p className="mt-1.5 text-[14px] text-graphite">{signal.intervention}</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
