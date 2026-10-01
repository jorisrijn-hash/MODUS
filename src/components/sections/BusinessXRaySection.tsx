"use client";

import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { BusinessXRay } from "@/components/sections/BusinessXRay";
import { useDict } from "@/lib/i18n/context";

export function BusinessXRaySection() {
  const dict = useDict();
  const t = dict.home.businessXRaySection;
  return (
    <section id="business-x-ray" className="border-t border-line py-24 md:py-32 scroll-mt-24">
      <Container>
        <div className="max-w-xl">
          <Reveal>
            <SectionLabel id="SYS / 02">{t.label}</SectionLabel>
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
          <BusinessXRay />
        </Reveal>
      </Container>
    </section>
  );
}
