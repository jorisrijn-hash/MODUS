"use client";

import { useState } from "react";
import Link from "next/link";
import { Reorder } from "motion/react";
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { ArrowRight, AlertTriangle, Lightbulb, CheckCircle2, GripVertical, Eye, EyeOff, Sliders } from "lucide-react";
import { AppCard, AppCardHeader } from "@/components/app/ui/AppCard";
import { StatCard } from "@/components/app/ui/StatCard";
import { StatusBadge } from "@/components/app/ui/StatusBadge";
import { Drawer } from "@/components/app/ui/Drawer";
import { ModusScore } from "@/components/app/ModusScore";
import { ModusBriefing } from "@/components/app/ModusBriefing";
import {
  DEMO_CLIENT,
  KPIS,
  MONTHLY_SERIES,
  SPARKLINES,
  SIGNALS,
  ACTIVITY,
  type Signal,
} from "@/lib/appDemo/data";
import {
  ALL_WIDGETS,
  WIDGET_LABELS,
  PRESETS,
  PRESET_LABELS,
  useOverviewLayout,
  type WidgetId,
  type PresetId,
} from "@/lib/appDemo/overviewLayout";

const SIGNAL_ICON = { high: AlertTriangle, opportunity: Lightbulb, positive: CheckCircle2 } as const;
const SIGNAL_TONE = { high: "warning", opportunity: "info", positive: "positive" } as const;

function todayLabel() {
  return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

function KpiRow() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard {...KPIS.revenue} prefix="€" size="large" sparkline={SPARKLINES.revenue} />
      <StatCard {...KPIS.leads} sparkline={SPARKLINES.leads} />
      <StatCard label="Conversion" value={KPIS.conversion.value} change={KPIS.conversion.change} suffix="%" format={(n) => n.toFixed(1)} sparkline={SPARKLINES.conversion} />
      <StatCard {...KPIS.visitors} sparkline={SPARKLINES.visitors} />
    </div>
  );
}

function InsightsRow() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
      <AppCard>
        <AppCardHeader
          title="Performance"
          action={
            <Link href="/app/performance" className="flex items-center gap-1 text-[12.5px] font-medium text-modus hover:underline">
              View details <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Link>
          }
        />
        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MONTHLY_SERIES} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="visitorsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#123C2D" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#123C2D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#70756F" }} axisLine={{ stroke: "#D9DCD7" }} tickLine={false} />
              <Tooltip
                contentStyle={{ border: "1px solid #D9DCD7", borderRadius: 6, fontSize: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
                labelStyle={{ color: "#151716", fontWeight: 500 }}
              />
              <Area type="monotone" dataKey="visitors" stroke="#123C2D" strokeWidth={2} fill="url(#visitorsFill)" animationDuration={900} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </AppCard>

      <ModusScore />
    </div>
  );
}

function ActivityRow({ onOpenSignal }: { onOpenSignal: (id: string) => void }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <AppCard padded={false}>
        <div className="flex items-center justify-between p-5 pb-0 sm:p-6 sm:pb-0">
          <AppCardHeader
            title="MODUS Signals"
            action={
              <Link href="/app/signals" className="flex items-center gap-1 text-[12.5px] font-medium text-modus hover:underline">
                View all <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </Link>
            }
          />
        </div>
        <ul className="mt-4 divide-y divide-line">
          {SIGNALS.slice(0, 3).map((signal) => {
            const Icon = SIGNAL_ICON[signal.priority];
            return (
              <li key={signal.id}>
                <button
                  type="button"
                  onClick={() => onOpenSignal(signal.id)}
                  className="flex w-full items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-surface/60 sm:px-6"
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted" strokeWidth={1.75} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-ink">{signal.title}</p>
                    <p className="mt-0.5 text-[11.5px] text-muted">{signal.timestamp}</p>
                  </div>
                  <StatusBadge tone={SIGNAL_TONE[signal.priority]}>{signal.priority}</StatusBadge>
                </button>
              </li>
            );
          })}
        </ul>
      </AppCard>

      <AppCard padded={false}>
        <div className="p-5 pb-0 sm:p-6 sm:pb-0">
          <AppCardHeader title="MODUS Activity" />
        </div>
        <ul className="mt-4 divide-y divide-line">
          {ACTIVITY.slice(0, 5).map((item) => (
            <li key={item.id} className="px-5 py-3.5 sm:px-6">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9.5px] uppercase tracking-[0.06em] text-muted">{item.category}</span>
              </div>
              <p className="mt-1 text-[13px] text-graphite">{item.text}</p>
              <p className="mt-0.5 text-[11.5px] text-muted">{item.timestamp}</p>
            </li>
          ))}
        </ul>
      </AppCard>
    </div>
  );
}

function WidgetBlock({ id, onOpenSignal }: { id: WidgetId; onOpenSignal: (signalId: string) => void }) {
  if (id === "briefing") return <ModusBriefing onOpenSignal={onOpenSignal} />;
  if (id === "kpis") return <KpiRow />;
  if (id === "insights") return <InsightsRow />;
  return <ActivityRow onOpenSignal={onOpenSignal} />;
}

export default function OverviewPage() {
  const firstName = DEMO_CLIENT.contactName.split(" ")[0];
  const layout = useOverviewLayout();
  const [active, setActive] = useState<Signal | null>(null);
  const [customizing, setCustomizing] = useState(false);
  const [draftOrder, setDraftOrder] = useState<WidgetId[]>(ALL_WIDGETS);
  const [draftVisible, setDraftVisible] = useState<Set<WidgetId>>(new Set(layout.order));

  function openSignal(id: string) {
    const signal = SIGNALS.find((s) => s.id === id);
    if (signal) setActive(signal);
  }

  function enterCustomize() {
    const hidden = ALL_WIDGETS.filter((w) => !layout.order.includes(w));
    setDraftOrder([...layout.order, ...hidden]);
    setDraftVisible(new Set(layout.order));
    setCustomizing(true);
  }

  function saveCustomize() {
    layout.setOrder(draftOrder.filter((w) => draftVisible.has(w)));
    setCustomizing(false);
  }

  function applyPresetDraft(preset: PresetId) {
    if (preset === "custom") return;
    const visible = PRESETS[preset];
    const hidden = ALL_WIDGETS.filter((w) => !visible.includes(w));
    setDraftOrder([...visible, ...hidden]);
    setDraftVisible(new Set(visible));
  }

  return (
    <div className="pb-20">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">{todayLabel()}</p>
          <h1 className="mt-1.5 text-[26px] font-semibold text-ink">
            Good morning, {firstName}.
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-[13.5px] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-modus" />
            MODUS active — {DEMO_CLIENT.name}
          </p>
        </div>
        {!customizing && (
          <button
            type="button"
            onClick={enterCustomize}
            className="flex items-center gap-1.5 rounded-md border border-line px-3.5 py-2 text-[12.5px] font-medium text-graphite transition-colors hover:border-ink/30"
          >
            <Sliders className="h-3.5 w-3.5" strokeWidth={1.75} />
            Customize
          </button>
        )}
      </div>

      {!customizing ? (
        <div className="space-y-6">
          {layout.order.map((id) => (
            <div key={id}>
              <WidgetBlock id={id} onOpenSignal={openSignal} />
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">Presets</span>
            {(Object.keys(PRESET_LABELS) as PresetId[])
              .filter((p) => p !== "custom")
              .map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => applyPresetDraft(p)}
                  className="rounded-md border border-line px-2.5 py-1 text-[12px] font-medium text-graphite transition-colors hover:border-ink/30"
                >
                  {PRESET_LABELS[p]}
                </button>
              ))}
          </div>

          <Reorder.Group axis="y" values={draftOrder} onReorder={setDraftOrder} className="space-y-2">
            {draftOrder.map((id) => {
              const visible = draftVisible.has(id);
              return (
                <Reorder.Item
                  key={id}
                  value={id}
                  className={`flex cursor-grab items-center gap-3 rounded-lg border bg-paper p-4 active:cursor-grabbing ${
                    visible ? "border-line" : "border-line/60 opacity-50"
                  }`}
                >
                  <GripVertical className="h-4 w-4 shrink-0 text-muted" strokeWidth={1.75} />
                  <span className="flex-1 text-[13.5px] font-medium text-ink">{WIDGET_LABELS[id]}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setDraftVisible((prev) => {
                        const next = new Set(prev);
                        if (next.has(id)) next.delete(id);
                        else next.add(id);
                        return next;
                      })
                    }
                    className="flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1 text-[11.5px] font-medium text-graphite transition-colors hover:border-ink/30"
                  >
                    {visible ? (
                      <>
                        <Eye className="h-3.5 w-3.5" strokeWidth={1.75} /> Visible
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3.5 w-3.5" strokeWidth={1.75} /> Hidden
                      </>
                    )}
                  </button>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>

          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ink px-6 py-4 text-paper md:left-60">
            <div className="mx-auto flex max-w-[1400px] items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-paper/60">
                {draftVisible.size} widgets visible
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCustomizing(false)}
                  className="rounded-md border border-paper/20 px-3.5 py-2 text-[12.5px] font-medium text-paper/80 transition-colors hover:border-paper/40"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveCustomize}
                  className="rounded-md bg-modus-light px-3.5 py-2 text-[12.5px] font-medium text-paper transition-colors hover:bg-modus"
                >
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Drawer open={!!active} onOpenChange={(open) => !open && setActive(null)} title={active?.title ?? ""}>
        {active && (
          <div>
            <StatusBadge tone={SIGNAL_TONE[active.priority]}>{active.priority}</StatusBadge>
            <p className="mt-4 text-[14px] leading-relaxed text-graphite">{active.explanation}</p>
            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.08em] text-muted">Observed → Diagnosed → Action → Result</p>
            <ol className="mt-3 space-y-3 border-l border-line pl-4">
              <li className="text-[13px] text-graphite">{active.story.observed}</li>
              <li className="text-[13px] text-graphite">{active.story.diagnosed}</li>
              <li className="text-[13px] text-graphite">{active.story.action}</li>
              {active.story.result && <li className="text-[13px] font-medium text-modus">{active.story.result}</li>}
            </ol>
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
