"use client";

import { motion } from "motion/react";
import { Check, X } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { useDict } from "@/lib/i18n/context";

export function NotConsulting() {
  const dict = useDict();
  const t = dict.howItWorks.notConsulting;
  const traditional = t.traditionalSteps;
  const modusPath = t.modusSteps;
  return (
    <section className="border-t border-line bg-surface/60 py-24 md:py-32">
      <Container>
        <div className="max-w-xl">
          <Reveal>
            <SectionLabel id="SYS / 04">{t.label}</SectionLabel>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 text-balance text-display-sm font-semibold text-ink">
              {t.heading}
            </h2>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              {t.traditionalLabel}
            </p>
            <ol className="mt-5 space-y-0">
              {traditional.map((step, i) => (
                <li
                  key={step}
                  className="flex items-center gap-3 border-b border-line py-3.5 first:pt-0 last:border-b-0"
                >
                  <X className="h-3.5 w-3.5 shrink-0 text-muted" strokeWidth={1.75} />
                  <span className="text-[15px] text-muted">{step}</span>
                  {i === traditional.length - 1 && (
                    <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                      {t.endLabel}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-modus">
              {t.modusLabel}
            </p>
            <ol className="mt-5 space-y-0">
              {modusPath.map((step, i) => (
                <motion.li
                  key={step}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-3 border-b border-line py-3.5 first:pt-0 last:border-b-0"
                >
                  <Check className="h-3.5 w-3.5 shrink-0 text-modus" strokeWidth={1.75} />
                  <span className="text-[15px] font-medium text-ink">{step}</span>
                  {i === modusPath.length - 1 && (
                    <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.1em] text-modus">
                      {t.ongoingLabel}
                    </span>
                  )}
                </motion.li>
              ))}
            </ol>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
