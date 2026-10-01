"use client";

import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { NumberTicker } from "@/components/ui/NumberTicker";
import { BeforeAfterMetric } from "@/components/ui/BeforeAfterMetric";
import { useDict } from "@/lib/i18n/context";

export function ImpactMetrics() {
  const dict = useDict();
  const t = dict.results.impactMetrics;
  const metricValues = [
    { value: 0.8, prefix: "+", suffix: "pp", decimals: 1 },
    { value: 31, prefix: "-", suffix: t.hoursUnit },
    { value: 18420, prefix: "€", suffix: "" },
  ];
  const metrics = t.metrics.map((m, i) => ({ ...m, ...metricValues[i] }));
  return (
    <section id="impact" className="border-t border-line py-24 md:py-32">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal>
              <SectionLabel id="SYS / 06">{t.label}</SectionLabel>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="mt-5 text-balance text-display-sm font-semibold text-ink">
                {t.heading}
              </h2>
            </Reveal>
          </div>
        </div>

        <div className="mt-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            {t.illustrativeNote}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          <Reveal className="bg-paper p-6">
            <BeforeAfterMetric before={t.responseTime.before} after={t.responseTime.after} deltaValue={80.5} />
            <p className="mt-3 text-[14px] font-medium text-graphite">
              {t.responseTime.label}
            </p>
            <p className="mt-1 text-[12.5px] text-muted">
              {t.responseTime.detail}
            </p>
          </Reveal>
          {metrics.map((metric, i) => (
            <Reveal key={metric.label} delay={(i + 1) * 0.06} className="bg-paper p-6">
              <p className="text-3xl font-semibold tracking-tight text-ink">
                <NumberTicker
                  value={metric.value}
                  prefix={metric.prefix}
                  suffix={metric.suffix}
                  decimals={metric.decimals ?? 0}
                />
              </p>
              <p className="mt-3 text-[14px] font-medium text-graphite">
                {metric.label}
              </p>
              <p className="mt-1 text-[12.5px] text-muted">{metric.detail}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
