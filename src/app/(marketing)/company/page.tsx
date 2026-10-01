import type { Metadata } from "next";
import { CategoryStatement } from "@/components/sections/CategoryStatement";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Footer } from "@/components/sections/Footer";
import { FooterReveal } from "@/components/sections/FooterReveal";
import { CompanyHero } from "@/components/sections/CompanyHero";
import { HumanPresence } from "@/components/sections/HumanPresence";

export const metadata: Metadata = {
  title: "Company | MODUS",
  description:
    "Businesses rarely break all at once. They become inefficient one workaround at a time, and that's why MODUS exists.",
};

export default function CompanyPage() {
  return (
    <>
      <main>
        <CompanyHero />

        <HumanPresence />

        <CategoryStatement />

        <FooterReveal lifting={<FinalCTA />} footer={<Footer />} />
      </main>
    </>
  );
}
