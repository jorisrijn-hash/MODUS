"use client";

import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { useDict } from "@/lib/i18n/context";

export function AICapability() {
  const dict = useDict();
  const t = dict.howItWorks.aiCapability;
  const applications = t.applications;
  return (
    <section className="border-t border-line bg-surface/60 py-24 md:py-32">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <Reveal>
              <SectionLabel id="SYS / 09">{t.label}</SectionLabel>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="mt-5 text-balance text-display-sm font-semibold text-ink">
                {t.heading}
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-graphite">
                {t.body1}
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <p className="mt-5 text-[15px] font-medium text-ink">
                {t.body2}
              </p>
            </Reveal>
          </div>

          <div>
            <Reveal delay={0.1}>
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                {t.whereItApplies}
              </p>
            </Reveal>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-0 border-t border-line">
              {applications.map((app, i) => (
                <Reveal as="li" key={app} delay={0.12 + i * 0.04}>
                  <div className="border-b border-line py-3.5 text-[14px] text-graphite">
                    {app}
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
