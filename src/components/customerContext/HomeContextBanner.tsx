"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useCustomerContext } from "@/lib/customerContext/useCustomerContext";
import { useDict } from "@/lib/i18n/context";

/**
 * The "intelligent layer over the standard website" from the brief: sits
 * near the hero CTA, doesn't touch the headline or core positioning. Renders
 * nothing for an anonymous visitor — the generic hero is the whole
 * experience for them, unchanged.
 */
export function HomeContextBanner() {
  const dict = useDict();
  const t = dict.customerContext;
  const { lifecycleState, companyName, summary, summaryStatus } = useCustomerContext();

  if (lifecycleState === "ANONYMOUS") return null;

  if (lifecycleState === "DIAGNOSTIC_STARTED") {
    return (
      <Link
        href="/diagnostic"
        className="group mt-2 flex max-w-md items-center justify-between gap-3 border border-line bg-white px-4 py-3 transition-colors hover:border-modus"
      >
        <span>
          <span className="block font-mono text-[10px] uppercase tracking-[0.1em] text-modus">
            {t.diagnosticInProgress.label}
          </span>
          <span className="mt-0.5 block text-[13px] text-graphite">{t.diagnosticInProgress.body}</span>
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-modus transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
      </Link>
    );
  }

  // PROFILE_READY: only render once the summary has actually loaded — no
  // placeholder numbers, no flash of an empty state that then jumps.
  if (summaryStatus !== "ready" || !summary) return null;

  return (
    <Link
      href="/diagnostic"
      className="group mt-2 flex max-w-md items-center justify-between gap-3 border border-line bg-white px-4 py-3 transition-colors hover:border-modus"
    >
      <span>
        <span className="block font-mono text-[10px] uppercase tracking-[0.1em] text-modus">
          {companyName ? `${companyName.toUpperCase()} / ${t.profileReady.label.toUpperCase()}` : t.profileReady.label}
        </span>
        <span className="mt-0.5 block text-[13px] text-graphite">
          {summary.signalsCount > 0
            ? dict.diagnosticShell.profileReady.signalsIdentified(summary.signalsCount)
            : dict.diagnosticShell.profileReady.profileReadyTitle}{" "}
          {summary.estimate && dict.diagnosticShell.profileReady.estimateAvailable}
        </span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-modus transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
    </Link>
  );
}
