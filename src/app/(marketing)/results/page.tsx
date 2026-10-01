import type { Metadata } from "next";
import { ImpactMetrics } from "@/components/sections/ImpactMetrics";
import { ResultsCase } from "@/components/sections/ResultsCase";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Footer } from "@/components/sections/Footer";
import { FooterReveal } from "@/components/sections/FooterReveal";
import { ResultsHero } from "@/components/sections/ResultsHero";

export const metadata: Metadata = {
  title: "Results | Business Optimization Case Studies",
  description:
    "What changed. Evidence from MODUS engagements, spanning context, signal, baseline, intervention and measured outcome, never fabricated.",
};

export default function ResultsPage() {
  return (
    <>
      <main>
        <ResultsHero />

        <ImpactMetrics />
        <ResultsCase />

        <FooterReveal lifting={<FinalCTA />} footer={<Footer />} />
      </main>
    </>
  );
}
