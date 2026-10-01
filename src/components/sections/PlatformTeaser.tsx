"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { PlatformMockup } from "@/components/sections/PlatformMockup";
import { useDict } from "@/lib/i18n/context";

export function PlatformTeaser() {
  const dict = useDict();
  const t = dict.home.platformTeaser;
  return (
    <section className="border-t border-line py-24 md:py-32">
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
          <Reveal delay={0.12}>
            <p className="mt-5 text-[15px] leading-relaxed text-graphite">
              {t.body}
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.16} className="mt-10">
          <PlatformMockup />
        </Reveal>

        <Reveal delay={0.2}>
          <Link
            href="/platform"
            className="group mt-8 inline-flex items-center gap-1.5 text-[14px] font-medium text-ink"
          >
            {t.link}
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 ease-modus group-hover:translate-x-0.5"
              strokeWidth={1.75}
            />
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
