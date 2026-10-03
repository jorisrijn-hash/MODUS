"use client";

import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { useLocale } from "@/lib/i18n/context";
import { MONTHLY_PLANS, PLAN_COPY } from "@/lib/pricing/plans";
import "@/components/admin/workspace.css";

/** Original implementation of the supplied comparison layout; no paid template code. */
export function PlanComparison({ detailed = false }: { detailed?: boolean }) {
  const { locale } = useLocale();
  const nl = locale === "nl";
  const copy = PLAN_COPY[nl ? "nl" : "en"];
  return (
    <div
      data-testid="plan-comparison"
      className="modus-workspace overflow-hidden rounded-2xl border border-line"
    >
      <div className="grid divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:grid-cols-[.8fr_1fr_1fr_1fr]">
        <div className="p-5 sm:col-span-3 lg:col-span-1 lg:p-6">
          <p className="workspace-eyebrow">
            {nl ? "Persoonlijke prijs" : "Personal pricing"}
          </p>
          <h3 className="mt-3 max-w-sm text-xl leading-tight">
            {nl
              ? "Jouw bedrijf bepaalt de scope."
              : "Your business shapes the scope."}
          </h3>
          <p className="mt-4 max-w-sm text-xs leading-relaxed text-muted">
            {nl
              ? "Indicatieve maandprijzen. De gratis diagnose geeft een persoonlijke prijsrange; na review bepalen we de scope en offerte."
              : "Indicative monthly prices. The free diagnostic gives a personal price range; review determines the scope and quote."}
          </p>
          <Link
            href="/diagnostic"
            className="workspace-primary mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-xs font-medium"
          >
            {nl ? "Krijg jouw persoonlijke prijs" : "Get your personal price"}
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {MONTHLY_PLANS.map((plan, index) => (
          <article
            key={plan.id}
            className={`flex flex-col p-5 lg:p-6 ${plan.bestValue ? "bg-surface" : ""}`}
            data-plan={plan.id}
          >
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold">{plan.name}</h3>
              {plan.bestValue && (
                <span className="workspace-primary rounded px-2 py-1 text-[9px] font-medium">
                  {nl ? "Beste keuze" : "Best value"}
                </span>
              )}
            </div>
            <p className="mt-3 min-h-10 text-xs leading-relaxed text-muted">
              {copy.descriptions[index]}
            </p>
            <p className="mt-5 text-3xl font-semibold tracking-tight">
              ≈ €{plan.monthly.toLocaleString(nl ? "nl-NL" : "en-GB")}
              <span className="ml-2 text-[11px] font-normal tracking-normal text-muted">
                {nl ? "p/m" : "/ month"}
              </span>
            </p>
            <ul className="mb-5 mt-5 flex-1 space-y-2.5">
              {copy.features[index]
                .slice(0, detailed ? 4 : 3)
                .map((feature, featureIndex) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-xs leading-relaxed text-graphite"
                  >
                    {!plan.os && featureIndex === 3 ? (
                      <span aria-hidden="true" className="w-3.5 shrink-0">
                        —
                      </span>
                    ) : (
                      <Check
                        aria-hidden="true"
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-modus"
                      />
                    )}
                    {feature}
                  </li>
                ))}
            </ul>
            {!detailed && (
              <p className="mb-4 text-[10px] text-muted">
                {plan.os
                  ? nl
                    ? "MODUS OS inbegrepen"
                    : "MODUS OS included"
                  : nl
                    ? "Zonder MODUS OS"
                    : "Without MODUS OS"}
              </p>
            )}
            <Link
              href={`/diagnostic?interest=${plan.id}`}
              className={`flex min-h-10 items-center justify-center rounded-full border border-line px-3 text-[11px] font-medium ${plan.bestValue ? "workspace-primary" : "text-ink hover:bg-surface"}`}
            >
              {nl ? "Bepaal mijn scope" : "Find my scope"}
            </Link>
          </article>
        ))}
      </div>
      {detailed && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left text-xs">
            <caption className="border-y border-line bg-surface px-5 py-3 text-left font-medium">
              {nl
                ? "Wat verandert per engagement?"
                : "What changes between engagements?"}
            </caption>
            <thead>
              <tr>
                <th scope="col" className="px-5 py-4 text-muted">
                  {nl ? "Scope" : "Scope"}
                </th>
                {MONTHLY_PLANS.map((plan) => (
                  <th
                    key={plan.id}
                    scope="col"
                    className="px-5 py-4 font-medium"
                  >
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {copy.rows.map((row) => (
                <tr key={row.label} className="border-t border-line">
                  <th scope="row" className="px-5 py-4 font-normal text-muted">
                    {row.label}
                  </th>
                  {row.values.map((value, index) => (
                    <td
                      key={index}
                      className={`px-5 py-4 leading-relaxed text-graphite ${index === 1 ? "bg-surface/60" : ""}`}
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="border-t border-line px-5 py-4 text-[10px] leading-relaxed text-muted">
        {nl
          ? "Geen onbeperkte uren of onbeperkte integraties. Capaciteit, tools, reviewfrequentie en opleveringen worden vooraf afgesproken. Advertentiebudget, externe tools en eventuele eenmalige implementatie staan apart in de offerte."
          : "No unlimited hours or integrations. Capacity, tools, review cadence and deliverables are agreed before work starts. Advertising spend, third-party tools and any one-time implementation are separate in the quote."}
      </p>
    </div>
  );
}
