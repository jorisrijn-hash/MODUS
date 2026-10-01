"use client";

import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { useDict } from "@/lib/i18n/context";

export function ModusBrief() {
  const dict = useDict();
  const t = dict.platform.modusBrief;
  return (
    <section className="border-t border-line bg-surface/60 py-24 md:py-32">
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
          <Reveal delay={0.12}>
            <p className="mt-5 text-[15px] leading-relaxed text-graphite">
              {t.body}
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.18} className="mt-10">
          <div className="relative max-w-md rounded-md border border-line bg-white p-6">
            <div className="reg-mark -left-1 -top-1" />
            <div className="reg-mark -right-1 -top-1" />
            <div className="reg-mark -bottom-1 -left-1" />
            <div className="reg-mark -bottom-1 -right-1" />

            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
              {t.dateLabel}
            </p>
            <p className="mt-3 text-[16px] font-medium text-ink">
              {t.greeting}
            </p>
            <p className="mt-1 text-[14px] text-graphite">
              {t.signalsNote}
            </p>

            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-line pt-5">
              <div>
                <p className="text-xl font-semibold text-ink">1</p>
                <p className="mt-1 text-[11.5px] text-muted">{t.stat1}</p>
              </div>
              <div>
                <p className="text-xl font-semibold text-ink">2</p>
                <p className="mt-1 text-[11.5px] text-muted">{t.stat2}</p>
              </div>
              <div>
                <p className="text-xl font-semibold text-modus">0</p>
                <p className="mt-1 text-[11.5px] text-muted">{t.stat3}</p>
              </div>
            </div>

            <div className="mt-5 border-t border-line pt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                {t.impactLabel}
              </p>
              <p className="mt-1.5 text-[15px] font-medium text-modus">
                {t.impactValue}
              </p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
