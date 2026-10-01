"use client";

import { useState } from "react";
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { PageHeader } from "@/components/app/ui/PageHeader";
import { AppCard, AppCardHeader } from "@/components/app/ui/AppCard";
import { StatCard } from "@/components/app/ui/StatCard";
import { KPIS, MONTHLY_SERIES, TRAFFIC_SOURCES } from "@/lib/appDemo/data";

const RANGES = ["7D", "30D", "90D", "12M"] as const;
// Mock data is monthly granularity — map each range to how many trailing
// months it shows rather than fabricating daily data that doesn't exist
// anywhere else in the dataset.
const RANGE_MONTHS: Record<(typeof RANGES)[number], number> = { "7D": 1, "30D": 2, "90D": 3, "12M": 12 };

const SOURCE_COLORS = ["#123C2D", "#1B5A43", "#70756F", "#C9B89F", "#D9DCD7"];

export default function PerformancePage() {
  const [range, setRange] = useState<(typeof RANGES)[number]>("12M");
  const series = MONTHLY_SERIES.slice(-RANGE_MONTHS[range]);

  return (
    <div>
      <PageHeader
        title="Performance"
        subtitle="Traffic, leads, conversion and revenue over time."
        action={
          <div className="flex items-center gap-1 rounded-md border border-line p-1">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`rounded px-2.5 py-1 text-[12px] font-medium transition-colors ${
                  range === r ? "bg-ink text-paper" : "text-muted hover:text-graphite"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard {...KPIS.visitors} />
        <StatCard {...KPIS.leads} />
        <StatCard label="Conversion" value={KPIS.conversion.value} change={KPIS.conversion.change} suffix="%" format={(n) => n.toFixed(1)} />
        <StatCard {...KPIS.revenue} prefix="€" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6">
        <AppCard>
          <AppCardHeader title="Traffic & Leads" />
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="perfVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#123C2D" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#123C2D" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="perfLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C9B89F" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#C9B89F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#EBEBE5" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#70756F" }} axisLine={{ stroke: "#D9DCD7" }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#70756F" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  contentStyle={{ border: "1px solid #D9DCD7", borderRadius: 6, fontSize: 12 }}
                  labelStyle={{ color: "#151716", fontWeight: 500 }}
                />
                <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#123C2D" strokeWidth={2} fill="url(#perfVisitors)" animationDuration={900} />
                <Area type="monotone" dataKey="leads" name="Leads" stroke="#C9B89F" strokeWidth={2} fill="url(#perfLeads)" animationDuration={900} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AppCard>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AppCard>
            <AppCardHeader title="Revenue" />
            <div className="mt-4 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={series} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#EBEBE5" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#70756F" }} axisLine={{ stroke: "#D9DCD7" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#70756F" }} axisLine={false} tickLine={false} width={44} />
                  <Tooltip
                    contentStyle={{ border: "1px solid #D9DCD7", borderRadius: 6, fontSize: 12 }}
                    formatter={(v) => [`€${Number(Array.isArray(v) ? v[0] : v).toLocaleString("nl-NL")}`, "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="#123C2D" radius={[3, 3, 0, 0]} animationDuration={900} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AppCard>

          <AppCard>
            <AppCardHeader title="Traffic Sources" />
            <ul className="mt-4 space-y-3">
              {TRAFFIC_SOURCES.map((s, i) => (
                <li key={s.source}>
                  <div className="flex items-center justify-between text-[12.5px]">
                    <span className="text-graphite">{s.source}</span>
                    <span className="font-medium text-ink">{s.visitors.toLocaleString("nl-NL")}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface">
                    <div
                      className="h-full rounded-full transition-[width] duration-700 ease-out"
                      style={{ width: `${s.share}%`, backgroundColor: SOURCE_COLORS[i] }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </AppCard>
        </div>
      </div>
    </div>
  );
}
