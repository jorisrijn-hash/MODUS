"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { MODUS_SCORE } from "@/lib/appDemo/data";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ModusScore() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="rounded-lg border border-line bg-paper p-6">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">MODUS Score</p>
        <p className="flex items-center gap-1 text-[11.5px] font-medium text-modus">
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
          {MODUS_SCORE.change}% this month
        </p>
      </div>

      <div className="mt-5 flex items-center gap-6">
        <div className="relative h-32 w-32 shrink-0">
          <svg viewBox="0 0 128 128" className="h-32 w-32 -rotate-90">
            <circle cx="64" cy="64" r={RADIUS} fill="none" stroke="#EBEBE5" strokeWidth="9" />
            <motion.circle
              cx="64"
              cy="64"
              r={RADIUS}
              fill="none"
              stroke="#123C2D"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - MODUS_SCORE.value / 100) }}
              transition={{ duration: reducedMotion ? 0.2 : 1.1, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[30px] font-semibold leading-none text-ink">{MODUS_SCORE.value}</span>
            <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.06em] text-muted">/ 100</span>
          </div>
        </div>

        <ul className="flex-1 space-y-2.5">
          {MODUS_SCORE.categories.map((cat, i) => (
            <li key={cat.label}>
              <Link
                href={cat.href}
                className="group flex items-center gap-3 rounded-md px-1.5 py-1 transition-colors hover:bg-surface/70"
              >
                <span className="w-20 shrink-0 text-[12px] text-graphite">{cat.label}</span>
                <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-surface">
                  <motion.span
                    className="absolute inset-y-0 left-0 rounded-full bg-modus"
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.value}%` }}
                    transition={{ duration: reducedMotion ? 0.2 : 0.7, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  />
                </span>
                <span className="w-7 shrink-0 text-right text-[12px] font-medium text-ink">{cat.value}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
