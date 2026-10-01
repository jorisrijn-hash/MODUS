"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { useDict } from "@/lib/i18n/context";

export function EngagementTeaser() {
  const dict = useDict();
  const t = dict.home.engagementTeaser;
  return (
    <section className="border-t border-line py-14">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <Reveal>
            <SectionLabel>{t.label}</SectionLabel>
          </Reveal>
          <Reveal delay={0.06}>
            <p className="font-mono text-[12px] uppercase tracking-[0.1em] text-muted">
              {t.loop.join(" · ")}
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <Link
              href="/pricing#engagement"
              className="group inline-flex items-center gap-1.5 text-[14px] font-medium text-ink"
            >
              {t.cta}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 ease-modus group-hover:translate-x-0.5"
                strokeWidth={1.75}
              />
            </Link>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
