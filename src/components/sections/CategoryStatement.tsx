"use client";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { TextReveal } from "@/components/ui/TextReveal";
import { useDict } from "@/lib/i18n/context";

export function CategoryStatement() {
  const dict = useDict();
  const t = dict.company.categoryStatement;
  return (
    <section className="border-t border-line bg-ink py-28 text-paper md:py-36">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <TextReveal
            as="h2"
            text={t.headline1}
            className="block text-balance text-display-sm font-semibold md:text-display-md"
          />
          <TextReveal
            as="h2"
            delay={0.1}
            text={t.headline2}
            className="mt-2 block text-balance text-display-sm font-semibold text-paper/50 md:text-display-md"
          />
          <Reveal delay={0.4}>
            <p className="mx-auto mt-8 max-w-lg text-[15px] leading-relaxed text-paper/70">
              {t.body}
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
