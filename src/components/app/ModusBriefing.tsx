"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { SIGNALS, BRIEFING_SIGNAL_IDS } from "@/lib/appDemo/data";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const PRIORITY_LABEL = { high: "Risk", opportunity: "Opportunity", positive: "Result" } as const;
const PRIORITY_DOT = { high: "bg-signal", opportunity: "bg-ink/40", positive: "bg-modus" } as const;

export function ModusBriefing({ onOpenSignal }: { onOpenSignal: (id: string) => void }) {
  const [expanded, setExpanded] = useState(true);
  const reducedMotion = usePrefersReducedMotion();
  const items = BRIEFING_SIGNAL_IDS.map((id) => SIGNALS.find((s) => s.id === id)).filter((s): s is NonNullable<typeof s> => !!s);

  return (
    <div className="rounded-lg border border-line bg-ink text-paper">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-5"
      >
        <div className="text-left">
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-paper/50">MODUS Briefing</p>
          <p className="mt-1 text-[15px] font-medium text-paper">{items.length} opportunities detected</p>
        </div>
        <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown className="h-4 w-4 text-paper/60" strokeWidth={1.75} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reducedMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.15 : 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <ul className="border-t border-paper/10 px-2 pb-2">
              {items.map((signal, i) => (
                <li key={signal.id}>
                  <button
                    type="button"
                    onClick={() => onOpenSignal(signal.id)}
                    className="flex w-full items-start gap-3 rounded-md px-4 py-3.5 text-left transition-colors hover:bg-paper/5"
                  >
                    <span className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center font-mono text-[10px] text-paper/40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.06em] text-paper/45">
                        <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[signal.priority]}`} />
                        {PRIORITY_LABEL[signal.priority]}
                      </span>
                      <p className="mt-1 text-[13.5px] text-paper/90">{signal.explanation.split(". ")[0]}.</p>
                      {signal.impact && <p className="mt-1 text-[12px] text-paper/50">{signal.impact}</p>}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            <div className="border-t border-paper/10 px-6 py-3.5">
              <Link
                href="/app/signals"
                className="flex items-center gap-1 text-[12.5px] font-medium text-paper/80 hover:text-paper"
              >
                View all signals <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
