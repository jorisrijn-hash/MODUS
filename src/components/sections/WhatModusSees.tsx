"use client";

import { useRef } from "react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { TextReveal } from "@/components/ui/TextReveal";
import { useGsapReveal } from "@/lib/motion/gsapHooks";
import { useDict } from "@/lib/i18n/context";

/**
 * Evolves the previous `Philosophy.tsx` section — same real copy and
 * same four symptom → real-cause examples (`dict.home.philosophy`,
 * untouched), same component still used verbatim for its content. What
 * changes is the framing: each pair now resolves as a small
 * Insight → Action → Result fragment (Section 9's request to give the
 * site some of `/app`'s intelligence feel without literally embedding a
 * dashboard), using a GSAP reveal per row (`useGsapReveal`, the
 * Checkpoint 2 primitive) instead of the previous Motion-only stagger,
 * for rhythm variety against the other Motion-based reveals on this page.
 */
export function WhatModusSees() {
  const dict = useDict();
  const t = dict.home.philosophy;
  const examples = t.examples;

  return (
    <section id="what-modus-sees" className="border-t border-line bg-surface/60 py-24 md:py-32 scroll-mt-24">
      <Container>
        <div className="max-w-xl">
          <Reveal>
            <SectionLabel id="SYS / 05">{t.label}</SectionLabel>
          </Reveal>
          <TextReveal
            as="h2"
            delay={0.06}
            text={t.heading}
            className="mt-5 block text-balance text-display-sm font-semibold text-ink"
          />
          <Reveal delay={0.12}>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-graphite">{t.body}</p>
          </Reveal>
        </div>

        <div className="mt-14 border-t border-line">
          {examples.map((ex, i) => (
            <ExampleRow key={ex.symptom} symptom={ex.symptom} real={ex.real} index={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function ExampleRow({ symptom, real, index }: { symptom: string; real: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useGsapReveal(ref, { start: `top ${88 - index * 2}%` });

  return (
    <div
      ref={ref}
      className="grid grid-cols-1 gap-2 border-b border-line py-6 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-6"
    >
      <p className="text-[15px] text-muted line-through decoration-muted/40">{symptom}</p>
      <span className="hidden font-mono text-[10px] uppercase tracking-[0.1em] text-modus sm:block">→</span>
      <p className="text-[15px] font-medium text-ink">{real}</p>
    </div>
  );
}
