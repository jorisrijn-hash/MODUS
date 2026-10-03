"use client";

import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { PlanComparison } from "@/components/pricing/PlanComparison";
import { useLocale } from "@/lib/i18n/context";

export function PricingGuidance() {
  const { locale } = useLocale();
  const nl = locale === "nl";
  return (
    <section
      id="how-pricing-works"
      className="border-b border-line py-16 md:py-20"
    >
      <Container>
        <Reveal>
          <SectionLabel id="SYS / 02">
            {nl ? "Prijs / Scope" : "Pricing / Scope"}
          </SectionLabel>
          <h2 className="mt-5 max-w-2xl text-display-sm font-semibold text-ink">
            {nl
              ? "Een richting, vóór een persoonlijke offerte."
              : "A starting point, before a personal quote."}
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-graphite">
            {nl
              ? "Kies geen pakket op gevoel. Begin met de gratis diagnose; jouw knelpunten en prioriteiten bepalen wat nuttig en haalbaar is."
              : "Choose scope from evidence. Start with the free diagnostic; your constraints and priorities determine what is useful and realistic."}
          </p>
        </Reveal>
        <Reveal delay={0.1} className="mt-8">
          <PlanComparison detailed />
        </Reveal>
      </Container>
    </section>
  );
}
