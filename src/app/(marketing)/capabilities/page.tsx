import type { Metadata } from "next";
import { Capabilities } from "@/components/sections/Capabilities";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Footer } from "@/components/sections/Footer";
import { FooterReveal } from "@/components/sections/FooterReveal";

export const metadata: Metadata = {
  title: "Capabilities | Workflow Automation, Business Systems & AI",
  description:
    "MODUS draws on operations, technology, intelligence, automation and customer systems, using whatever discipline is required to improve the business.",
};

export default function CapabilitiesPage() {
  return (
    <>
      <main className="pt-16">
        <Capabilities />
        <FooterReveal lifting={<FinalCTA />} footer={<Footer />} />
      </main>
    </>
  );
}
