"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { AnimatedChars } from "@/components/ui/AnimatedChars";
import { useDict } from "@/lib/i18n/context";
import { track } from "@/lib/chatbot";

export function PricingEstimateCTA() {
  const dict = useDict();
  const t = dict.pricing.estimateCta;

  return (
    <section className="border-b border-line bg-ink py-20 text-paper md:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <SectionLabel tone="on-dark">{t.label}</SectionLabel>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mx-auto mt-5 text-balance text-display-sm font-semibold">
              {t.heading}
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-paper/70">
              {t.body}
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-8 flex justify-center">
              <MagneticButton>
                <Link
                  href="/diagnostic"
                  onClick={() => track("pricing_diagnostic_clicked", { source: "estimate_cta" })}
                  data-chars-root=""
                  className="group group/cta relative inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[14px] font-medium text-paper transition-colors duration-200 ease-modus"
                >
                  <span data-chars-bg className="bg-modus group-hover/cta:bg-modus-light" aria-hidden="true" />
                  <AnimatedChars text={t.cta} />
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 ease-modus group-hover:translate-x-0.5"
                    strokeWidth={1.75}
                  />
                </Link>
              </MagneticButton>
            </div>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 font-mono text-[10px] uppercase tracking-[0.08em] text-paper/50">
              <span>{t.microTime}</span>
              <span className="h-1 w-1 rounded-full bg-paper/20" />
              <span>{t.microObligation}</span>
              <span className="h-1 w-1 rounded-full bg-paper/20" />
              <span>{t.microEstimate}</span>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
