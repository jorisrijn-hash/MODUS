"use client";

import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { useDict } from "@/lib/i18n/context";

export function ClientDay() {
  const dict = useDict();
  const t = dict.platform.clientDay;
  const events = t.events;
  return (
    <section className="border-t border-line bg-surface/60 py-24 md:py-32">
      <Container>
        <div className="max-w-xl">
          <Reveal>
            <SectionLabel id="SYS / 07">{t.label}</SectionLabel>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 text-balance text-display-sm font-semibold text-ink">
              {t.heading}
            </h2>
          </Reveal>
        </div>

        <div className="mt-12 max-w-2xl divide-y divide-line border-t border-line">
          {events.map((event, i) => (
            <Reveal key={event.time + i} delay={i * 0.05}>
              <div className="flex items-start gap-6 py-4">
                <p className="w-20 shrink-0 font-mono text-[12px] text-muted">
                  {event.time}
                </p>
                <p className="text-[14.5px] text-graphite">{event.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
