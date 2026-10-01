"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { AppCard, AppCardHeader } from "@/components/app/ui/AppCard";
import { PageHeader } from "@/components/app/ui/PageHeader";
import { StatusBadge } from "@/components/app/ui/StatusBadge";
import { Drawer } from "@/components/app/ui/Drawer";
import { CheckCircle2 } from "lucide-react";
import { WEBSITE_SCORES, WEBSITE_OPPORTUNITIES, WEBSITE_RESOLVED } from "@/lib/appDemo/data";

const SEVERITY_TONE = { high: "warning", medium: "info", low: "neutral" } as const;

const SCORES = [
  { label: "Performance", value: WEBSITE_SCORES.performance },
  { label: "Mobile Performance", value: WEBSITE_SCORES.mobile },
  { label: "SEO", value: WEBSITE_SCORES.seo },
  { label: "Accessibility", value: WEBSITE_SCORES.accessibility },
  { label: "Conversion", value: WEBSITE_SCORES.conversion },
];

export default function WebsitePage() {
  const [active, setActive] = useState<(typeof WEBSITE_OPPORTUNITIES)[number] | null>(null);

  return (
    <div>
      <PageHeader title="Website" subtitle="How your website is performing right now." />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {SCORES.map((s, i) => (
          <AppCard key={s.label} className="text-center">
            <div className="relative mx-auto h-20 w-20">
              <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#EBEBE5" strokeWidth="7" />
                <motion.circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke="#123C2D"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 34}
                  initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - s.value / 100) }}
                  transition={{ duration: 0.9, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[16px] font-semibold text-ink">
                {s.value}
              </span>
            </div>
            <p className="mt-3 text-[12px] text-graphite">{s.label}</p>
          </AppCard>
        ))}
      </div>

      <div className="mt-6">
        <AppCard padded={false}>
          <div className="p-5 pb-0 sm:p-6 sm:pb-0">
            <AppCardHeader title="MODUS Website Check" />
          </div>
          <ul className="mt-4 divide-y divide-line">
            {WEBSITE_OPPORTUNITIES.map((op) => (
              <li key={op.id}>
                <button
                  type="button"
                  onClick={() => setActive(op)}
                  className="flex w-full items-start justify-between gap-4 px-5 py-3.5 text-left transition-colors hover:bg-surface/60 sm:px-6"
                >
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-medium text-ink">{op.title}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-muted">{op.page}</p>
                  </div>
                  <StatusBadge tone={SEVERITY_TONE[op.severity as keyof typeof SEVERITY_TONE]} className="shrink-0">
                    {op.severity}
                  </StatusBadge>
                </button>
              </li>
            ))}
          </ul>
        </AppCard>
      </div>

      <div className="mt-6">
        <AppCard padded={false}>
          <div className="p-5 pb-0 sm:p-6 sm:pb-0">
            <AppCardHeader title="Recently Resolved" />
          </div>
          <ul className="mt-4 divide-y divide-line">
            {WEBSITE_RESOLVED.map((item) => (
              <li key={item.id} className="flex items-start gap-3 px-5 py-3.5 sm:px-6">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-modus" strokeWidth={1.75} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-medium text-ink">{item.title}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-muted">{item.page} · Resolved {item.resolvedDate}</p>
                  <p className="mt-1 text-[12.5px] text-graphite">{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </AppCard>
      </div>

      <Drawer open={!!active} onOpenChange={(open) => !open && setActive(null)} title={active?.title ?? ""}>
        {active && (
          <div>
            <StatusBadge tone={SEVERITY_TONE[active.severity as keyof typeof SEVERITY_TONE]}>{active.severity}</StatusBadge>
            <p className="mt-3 font-mono text-[11px] text-muted">{active.page}</p>
            <p className="mt-4 text-[13.5px] leading-relaxed text-graphite">{active.detail}</p>
          </div>
        )}
      </Drawer>
    </div>
  );
}
