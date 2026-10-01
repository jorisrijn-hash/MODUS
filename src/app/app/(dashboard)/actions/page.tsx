"use client";

import { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/app/ui/PageHeader";
import { StatusBadge } from "@/components/app/ui/StatusBadge";
import { Drawer } from "@/components/app/ui/Drawer";
import { ACTIONS, SIGNALS, type ActionCard, type ActionStatus } from "@/lib/appDemo/data";

const COLUMNS: { id: ActionStatus; label: string }[] = [
  { id: "discovered", label: "Discovered" },
  { id: "planned", label: "Planned" },
  { id: "in_progress", label: "In Progress" },
  { id: "completed", label: "Completed" },
];

const PRIORITY_TONE = { high: "warning", medium: "info", low: "neutral" } as const;

function nextStatus(status: ActionStatus): ActionStatus | null {
  const order: ActionStatus[] = ["discovered", "planned", "in_progress", "completed"];
  const i = order.indexOf(status);
  return i < order.length - 1 ? order[i + 1] : null;
}

export default function ActionsPage() {
  const [cards, setCards] = useState<ActionCard[]>(ACTIONS);
  const [active, setActive] = useState<ActionCard | null>(null);

  function moveCard(id: string, status: ActionStatus) {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    setActive((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
  }

  const relatedSignal = active?.relatedSignal ? SIGNALS.find((s) => s.id === active.relatedSignal) : undefined;

  return (
    <div>
      <PageHeader title="Actions" subtitle="Optimization work MODUS is running on your business." />

      <LayoutGroup>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => {
            const colCards = cards.filter((c) => c.status === col.id);
            return (
              <div key={col.id} className="rounded-lg border border-line bg-mineral/60 p-3">
                <div className="flex items-center justify-between px-1 pb-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">{col.label}</p>
                  <span className="font-mono text-[10px] text-muted">{colCards.length}</span>
                </div>
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {colCards.map((card) => {
                      const next = nextStatus(card.status);
                      return (
                        <motion.div
                          key={card.id}
                          layoutId={card.id}
                          layout
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                          className="group rounded-md border border-line bg-paper p-3"
                        >
                          <button type="button" onClick={() => setActive(card)} className="block w-full text-left">
                            <div className="flex items-center justify-between gap-2">
                              <StatusBadge tone={PRIORITY_TONE[card.priority]}>{card.category}</StatusBadge>
                              <span className="font-mono text-[10px] text-muted">{card.date}</span>
                            </div>
                            <p className="mt-2 text-[13px] font-medium leading-snug text-ink">{card.title}</p>
                            <div className="mt-1.5 flex items-center justify-between gap-2">
                              <p className="text-[11px] text-muted">{card.owner}</p>
                              {card.expectedImpact && (
                                <p className="text-[11px] font-medium text-modus">{card.expectedImpact}</p>
                              )}
                            </div>
                          </button>
                          {next && (
                            <button
                              type="button"
                              onClick={() => moveCard(card.id, next)}
                              className="mt-2 flex items-center gap-1 text-[11px] font-medium text-muted opacity-0 transition-opacity hover:text-modus group-hover:opacity-100"
                            >
                              Move to {COLUMNS.find((c) => c.id === next)?.label}
                              <ChevronRight className="h-3 w-3" strokeWidth={2} />
                            </button>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </LayoutGroup>

      <Drawer open={!!active} onOpenChange={(open) => !open && setActive(null)} title={active?.title ?? ""}>
        {active && (
          <div>
            <div className="flex items-center gap-2">
              <StatusBadge tone={PRIORITY_TONE[active.priority]}>{active.category}</StatusBadge>
              <StatusBadge tone="neutral">{`${active.priority} priority`}</StatusBadge>
            </div>
            <p className="mt-4 text-[12.5px] text-muted">Owner: {active.owner}</p>
            <p className="mt-1 text-[12.5px] text-muted">Date: {active.date}</p>
            {active.expectedImpact && (
              <p className="mt-1 text-[12.5px] font-medium text-modus">Expected impact: {active.expectedImpact}</p>
            )}

            {relatedSignal && (
              <div className="mt-5 rounded-md border border-line bg-mineral p-3.5">
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">From signal</p>
                <p className="mt-1.5 text-[13px] text-ink">{relatedSignal.title}</p>
              </div>
            )}

            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.08em] text-muted">Move to</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {COLUMNS.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => moveCard(active.id, col.id)}
                  className={`rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                    active.status === col.id
                      ? "border-ink bg-ink text-paper"
                      : "border-line text-graphite hover:border-ink/30"
                  }`}
                >
                  {col.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
