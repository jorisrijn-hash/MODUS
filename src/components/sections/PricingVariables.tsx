"use client";

import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { useDict } from "@/lib/i18n/context";

// Purely illustrative marker positions (0-100). No diagnostic has run yet
// on this page, so these aren't claiming to represent any real business.
const markerPositions = [42, 58, 50, 34, 63];

export function PricingVariables() {
  const dict = useDict();
  const t = dict.pricing.variables;

  return (
    <section className="border-b border-line py-20 md:py-28">
      <Container>
        <div className="max-w-xl">
          <Reveal>
            <SectionLabel id="SYS / 04">{t.label}</SectionLabel>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 text-balance text-display-sm font-semibold text-ink">
              {t.heading}
            </h2>
          </Reveal>
        </div>

        <div className="mt-10 divide-y divide-line border-t border-line">
          {t.items.map((item, i) => (
            <Reveal key={item.id}>
              <div className="grid grid-cols-1 gap-4 py-6 sm:grid-cols-[1.1fr_1.3fr] sm:gap-10">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
                    {item.id} / {item.name}
                  </p>
                  <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-graphite">
                    {item.body}
                  </p>
                </div>
                <div className="flex items-center gap-3 self-center">
                  <span className="font-mono text-[9px] uppercase tracking-[0.06em] text-muted">
                    {t.low}
                  </span>
                  <div className="relative h-px flex-1 bg-line">
                    <span
                      className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-modus"
                      style={{ left: `${markerPositions[i]}%` }}
                      aria-hidden
                    />
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.06em] text-muted">
                    {t.high}
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
