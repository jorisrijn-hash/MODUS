"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { AlertTriangle, Lightbulb, CheckCircle2, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/app/ui/PageHeader";
import { StatusBadge } from "@/components/app/ui/StatusBadge";
import { Drawer } from "@/components/app/ui/Drawer";
import { SIGNALS, type Signal } from "@/lib/appDemo/data";

const SIGNAL_ICON = { high: AlertTriangle, opportunity: Lightbulb, positive: CheckCircle2 } as const;
const SIGNAL_TONE = { high: "warning", opportunity: "info", positive: "positive" } as const;
const STATUS_LABEL = { open: "Open", in_progress: "In Progress", resolved: "Resolved" } as const;
const CONFIDENCE_LABEL = { high: "High confidence", medium: "Medium confidence", low: "Low confidence" } as const;

export default function SignalsPage() {
  const [active, setActive] = useState<Signal | null>(null);

  return (
    <div>
      <PageHeader title="MODUS Signals" subtitle="Things MODUS detected in your business this month." />

      <ul className="divide-y divide-line rounded-lg border border-line bg-paper">
        {SIGNALS.map((signal, i) => {
          const Icon = SIGNAL_ICON[signal.priority];
          return (
            <motion.li
              key={signal.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
            >
              <button
                type="button"
                onClick={() => setActive(signal)}
                className="flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-surface/60"
              >
                <Icon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-muted" strokeWidth={1.75} />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-ink">{signal.title}</p>
                  <p className="mt-1 text-[12.5px] text-muted">
                    {signal.timestamp} · {STATUS_LABEL[signal.status]}
                  </p>
                  {signal.impact && <p className="mt-1 text-[12px] text-modus">{signal.impact}</p>}
                </div>
                <StatusBadge tone={SIGNAL_TONE[signal.priority]} className="shrink-0">
                  {signal.priority}
                </StatusBadge>
              </button>
            </motion.li>
          );
        })}
      </ul>

      <Drawer open={!!active} onOpenChange={(open) => !open && setActive(null)} title={active?.title ?? ""}>
        {active && (
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={SIGNAL_TONE[active.priority]}>{active.priority}</StatusBadge>
              <StatusBadge tone="neutral">{STATUS_LABEL[active.status]}</StatusBadge>
              <StatusBadge tone="neutral">{CONFIDENCE_LABEL[active.confidence]}</StatusBadge>
            </div>
            <p className="mt-2 text-[12px] text-muted">{active.timestamp}</p>
            {active.impact && <p className="mt-3 text-[15px] font-medium text-modus">{active.impact}</p>}
            <p className="mt-4 text-[14px] leading-relaxed text-graphite">{active.explanation}</p>

            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
              Observed → Diagnosed → Action{active.story.result ? " → Result" : ""}
            </p>
            <ol className="mt-3 space-y-3 border-l border-line pl-4">
              <li className="text-[13px] text-graphite">{active.story.observed}</li>
              <li className="text-[13px] text-graphite">{active.story.diagnosed}</li>
              <li className="text-[13px] text-graphite">{active.story.action}</li>
              {active.story.result && <li className="text-[13px] font-medium text-modus">{active.story.result}</li>}
            </ol>

            <div className="mt-6 space-y-2 rounded-md border border-line bg-mineral p-4">
              {active.data.map((d) => (
                <div key={d.label} className="flex items-center justify-between text-[12.5px]">
                  <span className="text-muted">{d.label}</span>
                  <span className="font-medium text-ink">{d.value}</span>
                </div>
              ))}
            </div>

            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.08em] text-muted">MODUS Recommendation</p>
            <p className="mt-2 text-[13.5px] leading-relaxed text-graphite">{active.recommendation}</p>

            <div className="mt-6 flex items-center gap-2 rounded-md bg-ink px-4 py-3 text-[13px] font-medium text-paper">
              {active.actionLabel}
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
