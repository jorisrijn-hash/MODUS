"use client";

import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { useDict } from "@/lib/i18n/context";

export function Alternatives() {
  const dict = useDict();
  const t = dict.howItWorks.alternatives;
  return (
    <section className="border-t border-line py-24 md:py-32">
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
        </div>

        <div className="mt-14 grid grid-cols-1 gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {t.items.map((item, i) => (
            <Reveal key={item.option} delay={i * 0.05}>
              <div className="border-t border-line pt-5">
                <p className="text-[15px] font-medium text-ink">{item.option}</p>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{item.limit}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3}>
          <p className="mt-14 max-w-lg text-[15px] font-medium text-ink">{t.body}</p>
        </Reveal>
      </Container>
    </section>
  );
}
