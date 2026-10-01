"use client";

import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { TextReveal } from "@/components/ui/TextReveal";
import { useDict } from "@/lib/i18n/context";

export function ResultsHero() {
  const dict = useDict();
  const t = dict.results.hero;
  return (
    <section className="pb-8 pt-32 md:pt-40">
      <Container>
        <div className="max-w-xl">
          <Reveal>
            <SectionLabel id="SYS / 05">{t.label}</SectionLabel>
          </Reveal>
          <TextReveal
            as="h1"
            delay={0.06}
            text={t.headline}
            className="mt-5 block text-balance text-display-md font-semibold text-ink"
          />
          <Reveal delay={0.3}>
            <p className="mt-6 text-[15px] leading-relaxed text-graphite">
              {t.body}
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
