"use client";

import { motion } from "motion/react";
import {
  ScanSearch,
  Radar,
  Gauge,
  Waypoints,
  Activity,
  CircleCheck,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { useDict } from "@/lib/i18n/context";

const stepIcons = [ScanSearch, Radar, Gauge, Waypoints, Activity, CircleCheck];

export function ModusLoop() {
  const dict = useDict();
  const t = dict.howItWorks.modusLoop;
  const steps = t.steps.map((s, i) => ({
    id: String(i + 1).padStart(2, "0"),
    icon: stepIcons[i],
    ...s,
  }));
  return (
    <section id="loop" className="border-t border-line bg-surface/60 py-24 md:py-32">
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.3fr] lg:gap-16">
          <div>
            <Reveal>
              <SectionLabel>{t.label}</SectionLabel>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="mt-5 text-balance text-display-sm font-semibold text-ink">
                {t.heading}
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-graphite">
                {t.body}
              </p>
            </Reveal>
          </div>

          <div className="relative">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: "left" }}
              className="absolute left-0 right-0 top-6 hidden h-px bg-line md:block"
              aria-hidden
            />

            <ol className="relative grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-6 md:gap-x-4">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <Reveal as="li" key={step.id} delay={0.08 + i * 0.06} className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-paper">
                      <Icon className="h-4.5 w-4.5 text-modus" strokeWidth={1.6} />
                    </div>
                    <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                      {step.id}
                    </p>
                    <p className="mt-1 text-[14px] font-medium text-ink">{step.name}</p>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
                      {step.copy}
                    </p>
                  </Reveal>
                );
              })}
            </ol>

            <p className="mt-8 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              <span className="text-modus">↺</span> {t.footer}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
