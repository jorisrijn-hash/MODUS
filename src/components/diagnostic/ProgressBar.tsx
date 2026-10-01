"use client";

import { motion } from "motion/react";
import { useDict } from "@/lib/i18n/context";

/**
 * Checkpoint 5, Section 5 — replaces the previous six-circle-badges +
 * connecting-lines + percent-bar + "STEP 03/06 · 50% COMPLETE" text
 * combination (real UI weight for what should "reassure, not dominate")
 * with exactly the brief's own suggested minimal form: a step counter and
 * six restrained markers, nothing else. The active marker is a short
 * filled line rather than a dot, so progress still reads left-to-right at
 * a glance without needing a separate percent figure.
 */
export function ProgressBar({ step }: { step: number }) {
  const dict = useDict();
  const steps = dict.diagnosticShell.stepLabels;

  return (
    <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
      <span>
        {String(step + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
      </span>
      <div className="flex items-center gap-1.5" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={steps.length}>
        {steps.map((label, i) => (
          <motion.span
            key={label}
            aria-hidden
            animate={{ width: i === step ? 16 : 5, opacity: i <= step ? 1 : 0.35 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`h-[3px] rounded-full ${i <= step ? "bg-modus" : "bg-line"}`}
          />
        ))}
      </div>
    </div>
  );
}
