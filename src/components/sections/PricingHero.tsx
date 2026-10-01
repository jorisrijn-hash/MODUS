"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { TextReveal } from "@/components/ui/TextReveal";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { AnimatedChars } from "@/components/ui/AnimatedChars";
import { useDict } from "@/lib/i18n/context";
import { track, openChatbot } from "@/lib/chatbot";
import { useCustomerContext } from "@/lib/customerContext/useCustomerContext";
import { PriceCompositionNote } from "@/components/pricing/PriceCompositionNote";
import { ReviewSchedulingPanel } from "@/components/scheduling/ReviewSchedulingPanel";
import type { QualitativeLevel } from "@/lib/pricing/types";

export function PricingHero() {
  const { lifecycleState, companyName, summary, summaryStatus } = useCustomerContext();

  if (lifecycleState === "PROFILE_READY" && summaryStatus === "ready" && summary?.estimate) {
    return <PersonalizedPricingHero companyName={companyName} estimate={summary.estimate} />;
  }

  return <GenericPricingHero />;
}

function GenericPricingHero() {
  const dict = useDict();
  const t = dict.pricing.hero;
  return (
    <section className="border-b border-line pb-16 pt-32 md:pt-40">
      <Container>
        <div className="max-w-2xl">
          <Reveal>
            <SectionLabel id="SYS / 01">{t.label}</SectionLabel>
          </Reveal>
          <TextReveal
            as="h1"
            delay={0.06}
            text={t.headline}
            className="mt-5 block text-balance text-display-md font-semibold text-ink md:text-display-lg"
          />
          <Reveal delay={0.3}>
            <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-graphite">{t.body}</p>
          </Reveal>

          <Reveal delay={0.36}>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <MagneticButton>
                <Link
                  href="/diagnostic"
                  onClick={() => track("pricing_diagnostic_clicked", { source: "hero" })}
                  data-chars-root=""
                  className="group/cta relative inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[14px] font-medium text-paper transition-colors duration-200 ease-modus"
                >
                  <span data-chars-bg className="bg-modus group-hover/cta:bg-modus-light" aria-hidden="true" />
                  <AnimatedChars text={t.ctaPrimary} />
                  {/* Arrow stays a sibling of the split label, so it is never
                      broken into animated characters. */}
                  <ArrowRight className="relative h-4 w-4" strokeWidth={1.75} />
                </Link>
              </MagneticButton>
              <a
                href="#how-pricing-works"
                onClick={() => track("pricing_methodology_viewed")}
                className="text-[14px] font-medium text-ink underline decoration-line underline-offset-4 hover:text-modus"
              >
                {t.ctaSecondary}
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.42}>
            <div className="mt-8 flex flex-wrap items-center gap-4 font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
              <span>{t.microEstimate}</span>
              <span className="h-1 w-1 rounded-full bg-line" />
              <span>{t.microTime}</span>
              <span className="h-1 w-1 rounded-full bg-line" />
              <span>{t.microObligation}</span>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function PersonalizedPricingHero({
  companyName,
  estimate,
}: {
  companyName: string | null;
  estimate: NonNullable<ReturnType<typeof useCustomerContext>["summary"]>["estimate"];
}) {
  const dict = useDict();
  const t = dict.pricing.hero;
  const cc = dict.customerContext.pricing;
  const te = dict.diagnosticResult.estimate;
  const [showScheduling, setShowScheduling] = useState(false);
  if (!estimate) return null;

  const levelLabel: Record<QualitativeLevel, string> = {
    low: te.levelLow,
    moderate: te.levelModerate,
    high: te.levelHigh,
  };

  const factorRows: { label: string; level: QualitativeLevel }[] = [
    { label: te.factorBusinessScale, level: estimate.factors.businessScale },
    { label: te.factorSystemFragmentation, level: estimate.factors.systemFragmentation },
    { label: te.factorOperationalComplexity, level: estimate.factors.operationalComplexity },
    { label: te.factorImplementationScope, level: estimate.factors.implementationScope },
  ];

  return (
    <section className="border-b border-line pb-16 pt-32 md:pt-40">
      <Container>
        <div className="max-w-2xl">
          <Reveal>
            <SectionLabel id="SYS / 01">
              {companyName ? `${companyName.toUpperCase()} / ${cc.label.toUpperCase()}` : cc.label}
            </SectionLabel>
          </Reveal>

          <Reveal delay={0.06}>
            <h1 className="mt-5 text-balance text-display-md font-semibold text-ink md:text-display-lg">
              {estimate.manualScope
                ? te.manualScopeLabel
                : `€${estimate.min.toLocaleString("en-US")} – €${estimate.max.toLocaleString("en-US")} ${te.perMonth}`}
            </h1>
          </Reveal>

          <Reveal delay={0.14}>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-graphite">
              {estimate.manualScope ? te.manualScopeBody : cc.whyRange}
            </p>
          </Reveal>

          <Reveal delay={0.17}>
            <PriceCompositionNote className="mt-3" />
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
              {factorRows.map((f) => (
                <div key={f.label}>
                  <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted">{f.label}</p>
                  <p className="mt-1 text-[13px] font-medium text-ink">{levelLabel[f.level]}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.28}>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              {!showScheduling && (
                <MagneticButton>
                  <button
                    type="button"
                    onClick={() => {
                      track("pricing_review_clicked", { source: "personalized_hero" });
                      setShowScheduling(true);
                    }}
                    data-chars-root=""
                  className="group/cta relative inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[14px] font-medium text-paper transition-colors duration-200 ease-modus"
                  >
                    <span data-chars-bg className="bg-modus group-hover/cta:bg-modus-light" aria-hidden="true" />
                    <AnimatedChars text={cc.cta} />
                    <ArrowRight className="relative h-4 w-4" strokeWidth={1.75} />
                  </button>
                </MagneticButton>
              )}
              <a
                href="#how-pricing-works"
                onClick={() => track("pricing_methodology_viewed")}
                className="text-[14px] font-medium text-ink underline decoration-line underline-offset-4 hover:text-modus"
              >
                {t.ctaSecondary}
              </a>
              <button
                type="button"
                onClick={() => {
                  track("pricing_chat_clicked", { source: "personalized_hero" });
                  openChatbot();
                }}
                className="text-[14px] font-medium text-ink underline decoration-line underline-offset-4 hover:text-modus"
              >
                {dict.diagnosticResult.talkToModus}
              </button>
            </div>
          </Reveal>

          {showScheduling && (
            <Reveal delay={0.06}>
              <div className="mt-6 rounded-md border border-line bg-white p-6 sm:p-8">
                <ReviewSchedulingPanel />
              </div>
            </Reveal>
          )}
        </div>
      </Container>
    </section>
  );
}
