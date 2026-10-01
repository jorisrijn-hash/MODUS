"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { useDict } from "@/lib/i18n/context";

/**
 * Checkpoint 4, Section 10 — kept deliberately minimal, per the brief's
 * own instruction not to build a generic six-card icon grid and to use a
 * spatial/draggable interaction "only if it improves comprehension." A
 * plain, text-led list of the five real capability groups already
 * defined for the actual `/capabilities` page (`dict.capabilities.groups`
 * — reused, not duplicated into new copy) reads as confident restraint
 * here rather than an icon-grid filler section, and the real content
 * lives on its own dedicated page one click away.
 */
export function CapabilitiesPreview() {
  const dict = useDict();
  const t = dict.capabilities;

  return (
    <section className="border-t border-line py-24 md:py-32">
      <Container>
        <div className="max-w-xl">
          <Reveal>
            <SectionLabel id="SYS / 07">{dict.nav.capabilities}</SectionLabel>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 text-balance text-display-sm font-semibold text-ink">{t.hero.headline}</h2>
          </Reveal>
        </div>

        <div className="mt-12 border-t border-line">
          {t.groups.map((group, i) => (
            <Reveal key={group.name} delay={0.04 * i}>
              <div className="grid grid-cols-1 gap-2 border-b border-line py-6 sm:grid-cols-[180px_1fr] sm:items-baseline sm:gap-8">
                <h3 className="text-[17px] font-semibold text-ink">{group.name}</h3>
                <p className="max-w-lg text-[14px] leading-relaxed text-graphite">{group.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3}>
          <Link
            href="/capabilities"
            className="group mt-8 inline-flex items-center gap-1.5 text-[14px] font-medium text-ink"
          >
            {dict.nav.capabilities}
            <span className="transition-transform duration-200 ease-modus group-hover:translate-x-0.5">→</span>
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
