"use client";

import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { useDict } from "@/lib/i18n/context";

export function PricingProcess() {
  const dict = useDict();
  const t = dict.pricing.process;

  return (
    <section className="border-b border-line py-20 md:py-28">
      <Container>
        <div className="max-w-xl">
          <Reveal>
            <SectionLabel id="SYS / 05">{t.label}</SectionLabel>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 text-balance text-display-sm font-semibold text-ink">
              {t.heading}
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-5 text-[14.5px] leading-relaxed text-graphite">{t.body}</p>
          </Reveal>
        </div>

        <div className="mt-10 flex flex-wrap items-stretch gap-2 sm:gap-0">
          {t.steps.map((step, i) => (
            <Reveal key={step} delay={0.06 + i * 0.05} className="flex items-center">
              <div className="flex items-center gap-2 rounded-sm border border-line px-4 py-3">
                <span className="font-mono text-[10px] text-muted">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[13px] font-medium text-ink">{step}</span>
              </div>
              {i < t.steps.length - 1 && (
                <ArrowRight className="mx-2 h-3.5 w-3.5 shrink-0 text-line" strokeWidth={1.75} />
              )}
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
