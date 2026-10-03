"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { PlanComparison } from "@/components/pricing/PlanComparison";
import { useLocale } from "@/lib/i18n/context";

export function PricingPreview() {
  const { locale } = useLocale();
  const nl = locale === "nl";
  return (
    <section className="border-t border-line py-16 md:py-20">
      <Container>
        <Reveal>
          <SectionLabel id="SYS / 08">Engagement</SectionLabel>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <h2 className="max-w-xl text-display-sm font-semibold text-ink">
              {nl
                ? "Klein beginnen. Gericht groeien."
                : "Start small. Build with purpose."}
            </h2>
            <Link
              href="/pricing"
              className="text-sm text-ink underline underline-offset-4"
            >
              {nl
                ? "Vergelijk de volledige scope →"
                : "Compare the full scope →"}
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.1} className="mt-7">
          <PlanComparison />
        </Reveal>
      </Container>
    </section>
  );
}
