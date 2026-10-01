"use client";

import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { useDict } from "@/lib/i18n/context";

export function ResultsCase() {
  const dict = useDict();
  const t = dict.results.resultsCase;
  const fields = t.fields;
  const metrics = t.metrics;
  return (
    <section className="border-t border-line py-24 md:py-32">
      <Container>
        <div className="max-w-xl">
          <Reveal>
            <SectionLabel id="SYS / 018">{t.label}</SectionLabel>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 text-balance text-display-sm font-semibold text-ink">
              {t.heading}
            </h2>
          </Reveal>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 border-t border-line pt-10 sm:grid-cols-3">
          {metrics.map((m) => (
            <Reveal key={m.label}>
              <p className="text-3xl font-semibold text-ink">{m.value}</p>
              <p className="mt-1 text-[13px] text-muted">{m.label}</p>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 divide-y divide-line border-t border-line">
          {fields.map((field, i) => (
            <Reveal key={field.label} delay={i * 0.04}>
              <div className="grid grid-cols-1 gap-2 py-6 sm:grid-cols-[180px_1fr] sm:gap-8">
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
                  {field.label}
                </p>
                <p className="text-[14.5px] leading-relaxed text-graphite">
                  {field.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
