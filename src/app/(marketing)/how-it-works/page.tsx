import type { Metadata } from "next";
import { ModusLoop } from "@/components/sections/ModusLoop";
import { NotConsulting } from "@/components/sections/NotConsulting";
import { Alternatives } from "@/components/sections/Alternatives";
import { AICapability } from "@/components/sections/AICapability";
import { Continuity } from "@/components/sections/Continuity";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Footer } from "@/components/sections/Footer";
import { FooterReveal } from "@/components/sections/FooterReveal";
import { HowItWorksHero } from "@/components/sections/HowItWorksHero";
import { HowItWorksFaq } from "@/components/sections/HowItWorksFaq";

export const metadata: Metadata = {
  title: "How MODUS Works | Business Process Optimization",
  description:
    "How MODUS diagnoses, prioritizes, implements and measures improvement across a growing business, and why it stays involved after the first fix.",
};

export default function HowItWorksPage() {
  return (
    <>
      <main>
        <HowItWorksHero />

        <ModusLoop />
        <NotConsulting />
        <Alternatives />
        <AICapability />
        <Continuity />

        <HowItWorksFaq />

        <FooterReveal lifting={<FinalCTA />} footer={<Footer />} />
      </main>
    </>
  );
}
