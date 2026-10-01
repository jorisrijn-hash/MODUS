"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  Activity,
  Clock,
  Waypoints,
  Users,
  Globe,
  Mail,
  CalendarClock,
  CreditCard,
  Receipt,
  BarChart3,
  Megaphone,
} from "lucide-react";
import { useDict } from "@/lib/i18n/context";
import { WarpField, useWarpField } from "@/components/ui/WarpField";

/* ---------- Overview ---------- */

export function OverviewPanel() {
  const dict = useDict();
  const t = dict.platform.panels.overview;
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
          {t.businessHealth}
        </p>
        <p className="mt-2 text-3xl font-semibold text-ink">
          82 <span className="text-base font-normal text-muted">/ 100</span>
        </p>
        <p className="mt-1 text-[12px] text-modus">{t.stableStatus}</p>
      </div>
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
          {t.signals}
        </p>
        <p className="mt-2 text-3xl font-semibold text-ink">7</p>
        <p className="mt-1 text-[12px] text-muted">{t.nextReview}</p>
      </div>
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
          {t.activeImprovements}
        </p>
        <p className="mt-2 text-3xl font-semibold text-ink">3</p>
        <p className="mt-1 text-[12px] text-muted">
          {t.activeImprovementsDetail}
        </p>
      </div>
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
          {t.annualizedImpact}
        </p>
        <p className="mt-2 text-3xl font-semibold text-ink">{t.annualizedImpactValue}</p>
        <p className="mt-1 text-[12px] text-muted">{t.annualizedImpactDetail}</p>
      </div>
      <div className="sm:col-span-2">
        <TrendLine data={[22, 26, 24, 30, 28, 34, 32, 38, 36, 42, 44, 41, 47]} height={40} className="w-full" />
      </div>
    </div>
  );
}

/* ---------- Signals ---------- */

const signalIds = ["SIG / 021", "SIG / 022", "SIG / 023"];
const signalSeverity = ["HIGH", "MEDIUM", "MEDIUM"] as const;
const signalStatus = ["ASSESSED", "DETECTED", "PRIORITIZED"] as const;
const severityColor = { HIGH: "text-signal", MEDIUM: "text-modus" } as const;
const filterKeys = ["ALL", "HIGH", "ASSESSED", "NEW"] as const;

export function SignalsPanel() {
  const dict = useDict();
  const t = dict.platform.panels.signals;
  const signals = t.items.map((s, i) => ({
    ...s,
    id: signalIds[i],
    severity: signalSeverity[i],
    status: signalStatus[i],
  }));
  const [filter, setFilter] = useState<(typeof filterKeys)[number]>("ALL");

  const visible = signals.filter((s) => {
    if (filter === "ALL") return true;
    if (filter === "HIGH") return s.severity === "HIGH";
    if (filter === "ASSESSED") return s.status === "ASSESSED";
    if (filter === "NEW") return s.status === "DETECTED";
    return true;
  });

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {filterKeys.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-sm border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.06em] transition-colors ${
              filter === f
                ? "border-modus bg-modus/5 text-modus"
                : "border-line text-muted hover:border-modus/40"
            }`}
          >
            {t.filters[f]}
          </button>
        ))}
      </div>

      <div className="mt-4 divide-y divide-line border-t border-line">
        {visible.map((s) => (
          <div key={s.id} className="py-4 first:pt-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-muted">{s.id}</span>
              <span className={`font-mono text-[10px] uppercase tracking-[0.08em] ${severityColor[s.severity]}`}>
                {t.severity[s.severity]}
              </span>
            </div>
            <p className="mt-1.5 text-[13.5px] font-medium text-ink">{s.system}</p>
            <p className="mt-0.5 text-[13px] text-graphite">{s.text}</p>
            <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted">
              {t.statusPrefix} {t.status[s.status]}
            </p>
          </div>
        ))}
        {visible.length === 0 && (
          <p className="py-6 text-[13px] text-muted">{t.noneMatch}</p>
        )}
      </div>
    </div>
  );
}

/* ---------- Improvements ---------- */

const lifecycleKeys = ["DETECTED", "ASSESSED", "PRIORITIZED", "ACTIVE", "MEASURING", "VERIFIED"] as const;
const improvementIds = ["INT / 014", "INT / 015", "INT / 016"];
const improvementStages = [3, 4, 2];

export function ImprovementsPanel() {
  const dict = useDict();
  const t = dict.platform.panels.improvements;
  const improvements = t.items.map((item, i) => ({
    ...item,
    id: improvementIds[i],
    stage: improvementStages[i],
  }));
  return (
    <div className="divide-y divide-line">
      {improvements.map((item) => (
        <div key={item.id} className="py-4 first:pt-0">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-muted">{item.id}</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-modus">
              {t.lifecycle[lifecycleKeys[item.stage]]}
            </span>
          </div>
          <p className="mt-1.5 text-[14px] font-medium text-ink">{item.name}</p>
          <p className="mt-1 text-[12.5px] text-muted">{item.detail}</p>
          <div className="mt-3 flex items-center gap-1">
            {lifecycleKeys.map((stage, i) => (
              <span
                key={stage}
                className={`h-[3px] flex-1 rounded-full ${
                  i <= item.stage ? "bg-modus" : "bg-line"
                }`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Performance ---------- */

const perfTrends = [
  [90, 82, 74, 60, 45, 30, 20, 14],
  [27, 28, 29, 31, 32, 33, 34, 35],
  [148, 142, 138, 130, 125, 121, 118, 117],
  [84, 83, 82, 81, 80, 79.6, 79.4, 79.3],
];

export function PerformancePanel() {
  const dict = useDict();
  const perfMetrics = dict.platform.panels.performance.metrics.map((m, i) => ({
    ...m,
    trend: perfTrends[i],
  }));
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {perfMetrics.map((m) => (
        <div key={m.label}>
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
            {m.label}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[13px] text-muted line-through">{m.before}</span>
            <ArrowRight className="h-3 w-3 text-muted" strokeWidth={1.75} />
            <span className="text-xl font-semibold text-ink">{m.after}</span>
          </div>
          <TrendLine data={m.trend} height={32} className="mt-2 w-full" />
        </div>
      ))}
    </div>
  );
}

function TrendLine({
  data,
  height = 32,
  className = "",
}: {
  data: number[];
  height?: number;
  className?: string;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = max === min ? 50 : 100 - ((v - min) / (max - min)) * 100;
      return `${x},${(y / 100) * (height - 6) + 3}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className={className} style={{ height }}>
      <line x1="0" y1={height - 3} x2="100" y2={height - 3} stroke="#D9DCD7" strokeWidth="0.5" />
      <polyline points={points} fill="none" stroke="#123C2D" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* ---------- Systems ---------- */

type ToolId =
  | "hubspot"
  | "webflow"
  | "workspace"
  | "calendly"
  | "lightspeed"
  | "exact"
  | "ga4"
  | "googleAds";

type CategoryKey = "CRM" | "Website" | "Email" | "Booking" | "POS" | "Accounting" | "Analytics" | "Advertising";

const TOOL_META: Record<
  ToolId,
  { name: string; categoryKey: CategoryKey; icon: typeof Users; color: string }
> = {
  hubspot: { name: "HubSpot", categoryKey: "CRM", icon: Users, color: "#FF7A59" },
  webflow: { name: "Webflow", categoryKey: "Website", icon: Globe, color: "#146EF5" },
  workspace: { name: "Google Workspace", categoryKey: "Email", icon: Mail, color: "#4285F4" },
  calendly: { name: "Calendly", categoryKey: "Booking", icon: CalendarClock, color: "#0069FF" },
  lightspeed: { name: "Lightspeed", categoryKey: "POS", icon: CreditCard, color: "#E12726" },
  exact: { name: "Exact Online", categoryKey: "Accounting", icon: Receipt, color: "#0B3D91" },
  ga4: { name: "Google Analytics 4", categoryKey: "Analytics", icon: BarChart3, color: "#F9AB00" },
  googleAds: { name: "Google Ads", categoryKey: "Advertising", icon: Megaphone, color: "#34A853" },
};

type SysNode = { tool: ToolId; x: number; y: number };
type ConnState = "healthy" | "issue" | "none";
type SysConn = { from: ToolId; to: ToolId; state: ConnState };

const CORE = { x: 50, y: 44 };

const sysNodes: SysNode[] = [
  { tool: "hubspot", x: 50, y: 8 },
  { tool: "webflow", x: 13, y: 25 },
  { tool: "workspace", x: 87, y: 25 },
  { tool: "calendly", x: 13, y: 62 },
  { tool: "exact", x: 87, y: 62 },
  { tool: "lightspeed", x: 50, y: 80 },
];

const sysConns: SysConn[] = [
  { from: "hubspot", to: "webflow", state: "healthy" },
  { from: "hubspot", to: "workspace", state: "healthy" },
  { from: "hubspot", to: "calendly", state: "healthy" },
  { from: "calendly", to: "lightspeed", state: "healthy" },
  { from: "lightspeed", to: "exact", state: "issue" },
  { from: "hubspot", to: "exact", state: "none" },
];

const connStateColor: Record<ConnState, string> = {
  healthy: "#123C2D",
  issue: "#E03A2E",
  none: "#D9DCD7",
};

function findSysNode(tool: ToolId) {
  return sysNodes.find((n) => n.tool === tool)!;
}

type HealthRow = { tool: ToolId; status: "healthy" | "issue"; lastSync: string; trend: number[] };

const healthRows: HealthRow[] = [
  { tool: "hubspot", status: "healthy", lastSync: "2m ago", trend: [40, 44, 42, 48, 50, 54, 58, 60] },
  { tool: "webflow", status: "healthy", lastSync: "3m ago", trend: [30, 33, 35, 34, 38, 40, 42, 44] },
  { tool: "workspace", status: "healthy", lastSync: "1m ago", trend: [50, 52, 55, 54, 58, 60, 62, 64] },
  { tool: "ga4", status: "healthy", lastSync: "5m ago", trend: [20, 24, 22, 28, 30, 34, 33, 36] },
  { tool: "calendly", status: "healthy", lastSync: "1m ago", trend: [45, 46, 48, 47, 50, 52, 54, 55] },
  { tool: "lightspeed", status: "healthy", lastSync: "2m ago", trend: [55, 58, 56, 60, 62, 64, 63, 66] },
  { tool: "exact", status: "issue", lastSync: "15m ago", trend: [50, 48, 44, 40, 34, 28, 22, 18] },
  { tool: "googleAds", status: "healthy", lastSync: "7m ago", trend: [35, 37, 36, 40, 42, 44, 46, 48] },
];

const connectedCount = healthRows.filter((r) => r.status === "healthy").length;
const issueCount = healthRows.filter((r) => r.status === "issue").length;

function ToolChip({ tool, size = 18 }: { tool: ToolId; size?: number }) {
  const meta = TOOL_META[tool];
  const Icon = meta.icon;
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-sm"
      style={{ width: size, height: size, backgroundColor: `${meta.color}1A`, color: meta.color }}
    >
      <Icon style={{ width: size * 0.6, height: size * 0.6 }} strokeWidth={2} />
    </span>
  );
}

function RingProgress({ value }: { value: number }) {
  const r = 15;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 36 36" className="h-9 w-9 -rotate-90">
      <circle cx="18" cy="18" r={r} fill="none" stroke="#D9DCD7" strokeWidth="3" />
      <circle
        cx="18"
        cy="18"
        r={r}
        fill="none"
        stroke="#123C2D"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={`${(value / 100) * c} ${c}`}
      />
    </svg>
  );
}

function StatTile({
  icon,
  value,
  label,
  detail,
}: {
  icon: ReactNode;
  value: string;
  label: string;
  detail: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-sm border border-line px-3.5 py-3">
      {icon}
      <div>
        <p className="text-[17px] font-semibold leading-none text-ink">{value}</p>
        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.08em] text-muted">{label}</p>
        <p className="mt-0.5 text-[11px] text-muted">{detail}</p>
      </div>
    </div>
  );
}

type SystemsMapProps = {
  t: ReturnType<typeof useDict>["platform"]["panels"]["systems"];
  catLabels: Record<CategoryKey, string>;
  flows: Record<string, string>;
};

export function SystemsPanel() {
  const dict = useDict();
  const t = dict.platform.panels.systems;
  const catLabels = t.categories;
  const flows = t.flows;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-medium text-ink">{t.overviewTitle}</p>
          <p className="mt-1 text-[12.5px] text-muted">
            {t.summary(healthRows.length, issueCount)}
          </p>
        </div>
        <button className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.08em] text-graphite transition-colors hover:text-modus">
          {t.viewAll}
          <ArrowUpRight className="h-3 w-3" strokeWidth={1.75} />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <StatTile
          icon={<Waypoints className="h-4 w-4 text-modus" strokeWidth={1.6} />}
          value={String(connectedCount)}
          label={t.statConnected}
          detail={t.statConnectedDetail(healthRows.length)}
        />
        <StatTile
          icon={<Activity className="h-4 w-4 text-modus" strokeWidth={1.6} />}
          value={t.statHealthValue}
          label={t.statHealth}
          detail={t.statHealthDetail(issueCount)}
        />
        <StatTile
          icon={<RingProgress value={89} />}
          value="89%"
          label={t.statDataFlow}
          detail={t.statDataFlowDetail}
        />
        <StatTile
          icon={<Clock className="h-4 w-4 text-modus" strokeWidth={1.6} />}
          value="2m"
          label={t.statLastSync}
          detail={t.statLastSyncDetail}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
        <SystemsMap t={t} catLabels={catLabels} flows={flows} />

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
            {t.healthTitle}
          </p>
          <div className="mt-3 divide-y divide-line border-t border-line">
            {healthRows.map((row) => {
              const meta = TOOL_META[row.tool];
              return (
                <div key={row.tool} className="flex items-center gap-3 py-2.5">
                  <ToolChip tool={row.tool} size={20} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-medium text-ink">
                      {meta.name} <span className="text-muted">({catLabels[meta.categoryKey]})</span>
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[11px]">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: row.status === "healthy" ? "#123C2D" : "#E03A2E" }}
                      />
                      <span className={row.status === "healthy" ? "text-modus" : "text-signal"}>
                        {row.status === "healthy" ? t.statusHealthy : t.statusIssue}
                      </span>
                      <span className="text-muted">&middot; {row.lastSync}</span>
                    </p>
                  </div>
                  <TrendLine data={row.trend} height={20} className="w-12 shrink-0" />
                </div>
              );
            })}
          </div>
          <button className="mt-4 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.08em] text-graphite transition-colors hover:text-modus">
            {t.viewAllIntegrations}
            <ArrowRight className="h-3 w-3" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
}

function SystemsMap({ t, catLabels, flows }: SystemsMapProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
          {t.landscapeTitle}
        </p>
        <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.06em] text-muted">
          <span className="flex items-center gap-1">
            <span className="h-px w-3 bg-modus" /> {t.legendHealthy}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-px w-3 border-t border-dashed border-signal" /> {t.legendIssue}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-px w-3 border-t border-dashed border-line" /> {t.legendNoConnection}
          </span>
        </div>
      </div>

      <WarpField className="mt-3">
        <SystemsMapInner t={t} catLabels={catLabels} flows={flows} />
      </WarpField>
    </div>
  );
}

function SystemsMapInner({ t, catLabels, flows }: SystemsMapProps) {
  const { open, close, activeId } = useWarpField();

  return (
    <>
      <div className="relative aspect-[10/9] w-full">
        <svg viewBox="0 0 100 88" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
          {sysConns.map((c) => {
            const a = findSysNode(c.from);
            const b = findSysNode(c.to);
            const highlighted = activeId === c.from || activeId === c.to;
            return (
              <line
                key={c.from + c.to}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={connStateColor[c.state]}
                strokeWidth={highlighted ? 0.6 : 0.35}
                strokeDasharray={c.state !== "healthy" ? "1.5 1.5" : undefined}
                vectorEffect="non-scaling-stroke"
                style={{ transition: "stroke-width 150ms ease" }}
              />
            );
          })}
        </svg>

        <div
          style={{ left: `${CORE.x}%`, top: `${CORE.y}%` }}
          className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-sm bg-modus px-3 py-2.5 text-modus-foreground shadow-sm"
        >
          <span className="font-mono text-[8px] uppercase tracking-[0.08em] text-modus-foreground/70">
            {t.coreLabel}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.08em]">{t.coreValue}</span>
        </div>

        {sysNodes.map((n) => {
          const meta = TOOL_META[n.tool];
          const isActive = activeId === n.tool;
          return (
            <motion.button
              key={n.tool}
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={(e) => {
                if (isActive) {
                  close();
                  return;
                }
                open({
                  triggerEl: e.currentTarget,
                  id: n.tool,
                  label: `SYS / ${meta.name}`,
                  title: meta.name,
                  content: (
                    <>
                      <p className="text-[12.5px] text-graphite">
                        {t.dataFlowPrefix} {flows[n.tool as keyof typeof flows]}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {sysConns
                          .filter((c) => c.from === n.tool || c.to === n.tool)
                          .map((c) => (
                            <span
                              key={c.from + c.to}
                              className="rounded-sm border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.06em]"
                              style={{ borderColor: connStateColor[c.state], color: connStateColor[c.state] }}
                            >
                              {TOOL_META[c.from].name} -&gt; {TOOL_META[c.to].name}
                            </span>
                          ))}
                      </div>
                    </>
                  ),
                });
              }}
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
              className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-sm border bg-white px-2 py-1.5 transition-colors ${
                isActive ? "border-modus" : "border-line hover:border-modus/50"
              }`}
            >
              <ToolChip tool={n.tool} />
              <span className="text-left leading-tight">
                <span className="block font-mono text-[8px] uppercase tracking-[0.06em] text-muted">
                  {catLabels[meta.categoryKey]}
                </span>
                <span className="block text-[10.5px] font-medium text-ink">{meta.name}</span>
              </span>
            </motion.button>
          );
        })}
      </div>

      {!activeId && (
        <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.08em] text-muted">
          {t.clickPrompt}
        </p>
      )}
    </>
  );
}

/* ---------- Ask MODUS ---------- */

export function AskModusPanel() {
  const dict = useDict();
  const t = dict.platform.panels.askModus;
  return (
    <div className="space-y-3">
      <div className="ml-auto max-w-[85%] rounded-sm bg-mineral px-3.5 py-2.5">
        <p className="text-[13px] text-ink">{t.question}</p>
      </div>
      <div className="max-w-[92%] rounded-sm border border-line px-3.5 py-3">
        <p className="text-[13px] leading-relaxed text-graphite">
          {t.answer}
        </p>
        <div className="mt-2.5 grid grid-cols-2 gap-3 border-t border-line pt-2.5 text-[11.5px]">
          <div>
            <p className="text-muted">{t.primarySignal}</p>
            <p className="mt-0.5 font-medium text-graphite">{t.addressStep}</p>
          </div>
          <div>
            <p className="text-muted">{t.recommendation}</p>
            <p className="mt-0.5 font-medium text-graphite">{t.reviewMobileInput}</p>
          </div>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-2">
          <span className="rounded-sm border border-line px-2 py-1 font-mono text-[9px] uppercase tracking-[0.06em] text-graphite">
            {t.viewSignal}
          </span>
          <span className="rounded-sm border border-line px-2 py-1 font-mono text-[9px] uppercase tracking-[0.06em] text-graphite">
            {t.openFormAnalysis}
          </span>
        </div>
      </div>
    </div>
  );
}
