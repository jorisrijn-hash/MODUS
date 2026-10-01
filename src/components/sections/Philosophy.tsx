"use client";

import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { TextReveal } from "@/components/ui/TextReveal";
import { useDict } from "@/lib/i18n/context";

export function Philosophy() {
  const dict = useDict();
  const t = dict.home.philosophy;
  const examples = t.examples;
  return (
    <section id="philosophy" className="border-t border-line bg-surface/60 py-24 md:py-32">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <Reveal>
              <SectionLabel id="SYS / 07">{t.label}</SectionLabel>
            </Reveal>
            <TextReveal
              as="h2"
              delay={0.06}
              text={t.heading}
              className="mt-5 block text-balance text-display-sm font-semibold text-ink"
            />
            <Reveal delay={0.12}>
              <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-graphite">
                {t.body}
              </p>
            </Reveal>
          </div>

          <div className="space-y-0 border-t border-line">
            {examples.map((ex, i) => (
              <Reveal key={ex.symptom} delay={i * 0.06}>
                <div className="grid grid-cols-1 gap-1 border-b border-line py-5 sm:grid-cols-2 sm:gap-6">
                  <p className="text-[15px] text-muted line-through decoration-muted/40">
                    {ex.symptom}
                  </p>
                  <p className="text-[15px] font-medium text-ink">{ex.real}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
