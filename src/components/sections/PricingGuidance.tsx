"use client";

import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { useDict } from "@/lib/i18n/context";
import { PRICING_CONFIG } from "@/lib/pricing/config";
import { PriceCompositionNote } from "@/components/pricing/PriceCompositionNote";

const bands = PRICING_CONFIG.monthly.bands;
const startingAt = PRICING_CONFIG.monthly.minimum;
const typicalMin = bands[1].estimateMin;
const typicalMax = bands[4].estimateMax;
const complexFrom = bands[5].startingAt;

function formatEUR(value: number): string {
  return `€${value.toLocaleString("en-US")}`;
}

export function PricingGuidance() {
  const dict = useDict();
  const t = dict.pricing.guidance;

  return (
    <section id="how-pricing-works" className="border-b border-line py-20 md:py-28">
      <Container>
        <div className="max-w-xl">
          <Reveal>
            <SectionLabel id="SYS / 02">{t.label}</SectionLabel>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 text-balance text-display-sm font-semibold text-ink">{t.heading}</h2>
          </Reveal>
        </div>

        <div className="mt-10 grid grid-cols-1 divide-y divide-line border border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <Reveal className="p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
              {t.startingLabel}
            </p>
            <p className="mt-3 text-3xl font-semibold text-ink">
              {formatEUR(startingAt)}
              <span className="text-base font-normal text-muted"> {t.perMonth}</span>
            </p>
          </Reveal>
          <Reveal delay={0.06} className="p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
              {t.typicalLabel}
            </p>
            <p className="mt-3 text-3xl font-semibold text-ink">
              {formatEUR(typicalMin)}
              {"–"}
              {formatEUR(typicalMax)}
              <span className="text-base font-normal text-muted"> {t.perMonth}</span>
            </p>
          </Reveal>
          <Reveal delay={0.12} className="p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
              {t.complexLabel}
            </p>
            <p className="mt-3 text-3xl font-semibold text-ink">
              {t.from} {formatEUR(complexFrom)}
              <span className="text-base font-normal text-muted"> {t.perMonth}</span>
            </p>
            <p className="mt-1 text-[12px] text-muted">{t.complexNote}</p>
          </Reveal>
        </div>

        <Reveal delay={0.16} className="mt-5">
          <PriceCompositionNote />
        </Reveal>

        <Reveal delay={0.18} className="mt-4 flex items-center justify-between border border-line px-6 py-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
            {t.diagnosticLabel}
          </p>
          <p className="text-[15px] font-medium text-modus">{t.diagnosticValue}</p>
        </Reveal>
      </Container>
    </section>
  );
}
