import type { Metadata } from "next";
import { PricingHero } from "@/components/sections/PricingHero";
import { PricingGuidance } from "@/components/sections/PricingGuidance";
import { PricingCapabilities } from "@/components/sections/PricingCapabilities";
import { EngagementStack } from "@/components/sections/EngagementStack";
import { PricingVariables } from "@/components/sections/PricingVariables";
import { PricingEstimateCTA } from "@/components/sections/PricingEstimateCTA";
import { PricingProcess } from "@/components/sections/PricingProcess";
import { PricingFaq } from "@/components/sections/PricingFaq";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Footer } from "@/components/sections/Footer";
import { FooterReveal } from "@/components/sections/FooterReveal";

export const metadata: Metadata = {
  title: "MODUS Pricing | Business Improvement Engagements",
  description:
    "Broad guidance on MODUS engagement pricing, what shapes the price, and how the free Business Diagnostic produces a personal initial estimate.",
};

export default function PricingPage() {
  return (
    <>
      <main>
        <PricingHero />
        <PricingGuidance />
        <PricingCapabilities />
        <EngagementStack />
        <PricingVariables />
        <PricingEstimateCTA />
        <PricingProcess />
        <PricingFaq />
        <FooterReveal lifting={<FinalCTA />} footer={<Footer />} />
      </main>
    </>
  );
}
