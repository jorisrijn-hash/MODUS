"use client";

import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { TextReveal } from "@/components/ui/TextReveal";
import { useDict } from "@/lib/i18n/context";

export function HowItWorksHero() {
  const dict = useDict();
  const t = dict.howItWorks;
  return (
    <section className="border-b border-line pb-20 pt-32 md:pt-40">
      <Container>
        <div className="max-w-2xl">
          <Reveal>
            <SectionLabel id="SYS / 01">{t.hero.label}</SectionLabel>
          </Reveal>
          <TextReveal
            as="h1"
            delay={0.06}
            text={t.hero.headline}
            className="mt-5 block text-balance text-display-md font-semibold text-ink"
          />
          <Reveal delay={0.3}>
            <p className="mt-6 text-[16px] leading-relaxed text-graphite">
              {t.hero.body}
            </p>
          </Reveal>
        </div>

        <div className="mt-12 divide-y divide-line border-t border-line">
          {t.symptoms.map((symptom, i) => (
            <Reveal key={symptom} delay={i * 0.04}>
              <div className="flex items-start gap-4 py-4">
                <span className="mt-0.5 font-mono text-[11px] text-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[15px] text-graphite">{symptom}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
