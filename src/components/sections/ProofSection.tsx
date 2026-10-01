"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { useDict } from "@/lib/i18n/context";

export function ProofSection() {
  const dict = useDict();
  const t = dict.home.proofSection;
  const metrics = t.metrics;
  return (
    <section className="border-t border-line bg-surface/60 py-24 md:py-32">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal>
              <SectionLabel id="SYS / 05">{t.label}</SectionLabel>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="mt-5 text-balance text-display-sm font-semibold text-ink">
                {t.heading}
              </h2>
            </Reveal>
          </div>
        </div>

        <div className="mt-8 rounded-md border border-line bg-white p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-16">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                {t.context}
              </p>
              <p className="mt-3 max-w-md text-[14.5px] leading-relaxed text-graphite">
                {t.body}
              </p>
              <Link
                href="/results"
                className="group mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-ink"
              >
                {t.link}
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 ease-modus group-hover:translate-x-0.5"
                  strokeWidth={1.75}
                />
              </Link>
            </div>

            <div className="flex gap-8 border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-16 lg:pt-0">
              {metrics.map((m) => (
                <div key={m.label}>
                  <p className="text-2xl font-semibold text-ink md:text-3xl">{m.value}</p>
                  <p className="mt-1 max-w-[9rem] text-[12px] text-muted">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
