import type { Metadata } from "next";
import { Platform } from "@/components/sections/Platform";
import { ModusBrief } from "@/components/sections/ModusBrief";
import { ClientDay } from "@/components/sections/ClientDay";
import { AskModus } from "@/components/sections/AskModus";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Footer } from "@/components/sections/Footer";
import { FooterReveal } from "@/components/sections/FooterReveal";

export const metadata: Metadata = {
  title: "The MODUS Platform | Operational Intelligence",
  description:
    "Business health, signals, active work and measured outcomes in one private platform, plus a daily brief and a direct line to ask MODUS anything.",
};

export default function PlatformPage() {
  return (
    <>
      <main>
        <Platform />
        <ModusBrief />
        <ClientDay />
        <AskModus />
        <FooterReveal lifting={<FinalCTA />} footer={<Footer />} />
      </main>
    </>
  );
}
