"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { DiagnosticCTA } from "@/components/ui/DiagnosticCTA";
import { useDict } from "@/lib/i18n/context";

/**
 * New — Checkpoint 4, Section 15. The three real MODUS plans (€200 /
 * €750 / €1,000 per month), not a copy of the reference's pricing
 * structure. Deliberately calmer than the hero/process sections — plain
 * cards, no accent fills, no fluid field emphasis — the brief's own
 * instruction. Advertising spend is noted as always separate, matching
 * the real commercial model established throughout this project.
 */
export function PricingPreview() {
  const dict = useDict();
  const t = dict.home.pricingPreview;

  return (
    <section className="border-t border-line py-24 md:py-32">
      <Container>
        <div className="max-w-xl">
          <Reveal>
            <SectionLabel id="SYS / 08">{t.label}</SectionLabel>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 text-balance text-display-sm font-semibold text-ink">{t.heading}</h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-graphite">{t.body}</p>
          </Reveal>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {t.plans.map((plan, i) => (
            <Reveal key={plan.name} delay={0.08 + i * 0.06}>
              <div className="flex h-full flex-col rounded-md border border-line bg-paper p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">{plan.name}</p>
                <p className="mt-3 text-2xl font-semibold text-ink">
                  {plan.price}
                  <span className="text-[13px] font-normal text-muted">{plan.period}</span>
                </p>
                <p className="mt-3 flex-1 text-[13.5px] leading-relaxed text-graphite">{plan.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3}>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <DiagnosticCTA variant="inline" source="pricing_preview" />
            <Link href="/pricing" className="group inline-flex items-center gap-1.5 text-[14px] font-medium text-ink">
              {t.cta}
              <span className="transition-transform duration-200 ease-modus group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
