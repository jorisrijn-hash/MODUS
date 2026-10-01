"use client";

import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { useDict } from "@/lib/i18n/context";

export function PricingCapabilities() {
  const dict = useDict();
  const t = dict.pricing.notServices;

  return (
    <section className="border-b border-line bg-surface/60 py-20 md:py-28">
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <Reveal>
              <SectionLabel id="SYS / 03">{t.label}</SectionLabel>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="mt-5 text-balance text-display-sm font-semibold text-ink">
                {t.heading}
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-graphite">{t.body}</p>
            </Reveal>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
            {t.disciplines.map((d, i) => (
              <Reveal key={d} delay={0.1 + i * 0.04}>
                <div className="flex items-center gap-2 border-l-2 border-modus/30 py-1.5 pl-3 text-[13.5px] text-graphite">
                  {d}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
