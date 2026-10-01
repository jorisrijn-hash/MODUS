"use client";

import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { useDict } from "@/lib/i18n/context";

export function HowItWorksFaq() {
  const dict = useDict();
  const t = dict.howItWorks.faq;
  return (
    <section className="border-t border-line py-24 md:py-32">
      <Container>
        <div className="max-w-xl">
          <Reveal>
            <SectionLabel id="SYS / 10">{t.label}</SectionLabel>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 text-balance text-display-sm font-semibold text-ink">
              {t.heading}
            </h2>
          </Reveal>
        </div>

        <div className="mt-10 divide-y divide-line border-t border-line">
          {t.items.map((item, i) => (
            <Reveal key={item.q} delay={i * 0.05}>
              <div className="grid grid-cols-1 gap-2 py-6 sm:grid-cols-[1fr_1.4fr] sm:gap-8">
                <p className="text-[15px] font-medium text-ink">{item.q}</p>
                <p className="text-[14.5px] leading-relaxed text-graphite">
                  {item.a}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
