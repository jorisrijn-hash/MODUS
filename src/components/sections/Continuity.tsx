"use client";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { TextReveal } from "@/components/ui/TextReveal";
import { useDict } from "@/lib/i18n/context";

export function Continuity() {
  const dict = useDict();
  const t = dict.howItWorks.continuity;
  return (
    <section className="border-t border-line py-24 md:py-32">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <TextReveal
            as="h2"
            text={t.headline}
            className="block text-balance text-display-sm font-semibold text-ink"
          />
        </div>

        <div className="mx-auto mt-12 flex max-w-2xl flex-wrap justify-center gap-x-8 gap-y-3">
          {t.drivers.map((d, i) => (
            <Reveal key={d} delay={i * 0.04}>
              <span className="text-[13.5px] text-muted">{d}</span>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3}>
          <p className="mx-auto mt-10 max-w-md text-center text-[15px] font-medium text-ink">
            {t.body}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
