"use client";

import { Gauge, Cpu, ChartSpline, Workflow, Users } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { TextReveal } from "@/components/ui/TextReveal";
import { useDict } from "@/lib/i18n/context";

const groupIcons = [Gauge, Cpu, ChartSpline, Workflow, Users];

export function Capabilities() {
  const dict = useDict();
  const t = dict.capabilities;
  const groups = t.groups.map((g, i) => ({ ...g, icon: groupIcons[i] }));
  return (
    <section className="border-t border-line py-24 md:py-32">
      <Container>
        <div className="max-w-lg">
          <Reveal>
            <SectionLabel id="SYS / 02">{t.hero.label}</SectionLabel>
          </Reveal>
          <TextReveal
            as="h1"
            delay={0.06}
            text={t.hero.headline}
            className="mt-5 block text-balance text-display-md font-semibold text-ink"
          />
          <Reveal delay={0.3}>
            <p className="mt-6 text-[15px] leading-relaxed text-graphite">
              {t.hero.body}
            </p>
          </Reveal>
        </div>

        <div className="mt-14 divide-y divide-line border-t border-line">
          {groups.map((group, i) => {
            const Icon = group.icon;
            return (
              <Reveal key={group.name} delay={i * 0.05}>
                <div className="grid grid-cols-1 gap-6 py-8 sm:grid-cols-[1.4fr_1fr] sm:items-start sm:gap-10">
                  <div>
                    <Icon className="h-5 w-5 text-modus" strokeWidth={1.6} />
                    <h2 className="mt-4 text-xl font-semibold text-ink">
                      {group.name}
                    </h2>
                    <p className="mt-2 max-w-sm text-[14.5px] leading-relaxed text-graphite">
                      {group.copy}
                    </p>
                  </div>
                  <ul className="grid grid-cols-2 gap-x-6 gap-y-2 sm:pt-1">
                    {group.items.map((item) => (
                      <li key={item} className="text-[13.5px] text-muted">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
