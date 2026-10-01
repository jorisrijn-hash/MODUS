import { Hero } from "@/components/sections/Hero";
import { CentralInsight } from "@/components/sections/CentralInsight";
import { ModusProcessSection } from "@/components/sections/ModusProcessSection";
import { WhatModusSees } from "@/components/sections/WhatModusSees";
import { BusinessXRaySection } from "@/components/sections/BusinessXRaySection";
import { CapabilitiesPreview } from "@/components/sections/CapabilitiesPreview";
import { CasesPreview } from "@/components/sections/CasesPreview";
import { PlatformTeaser } from "@/components/sections/PlatformTeaser";
import { PricingPreview } from "@/components/sections/PricingPreview";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Footer } from "@/components/sections/Footer";
import { FooterReveal } from "@/components/sections/FooterReveal";

// Checkpoint 4 homepage. Information architecture, per
// MODUS_REDESIGN_REPORT.md's Checkpoint 4 entry for the full reasoning
// behind every consolidation:
//   Hero → Problem (CentralInsight) → Diagnostic entry (new) →
//   MODUS Process (new, signature) → What MODUS Sees (evolved Philosophy)
//   → Business X-Ray (unchanged) → Capabilities (new, minimal) →
//   Cases (evolved ProofSection) → Platform (unchanged) → Pricing (new)
//   → Final CTA → Footer
//
// Checkpoint 5.5 (visual-direction reset, second pass): the diagnostic
// entry interaction moved INTO the hero itself (floating over the fluid
// field, replacing the hero's old two-button CTA row) — no longer a
// separate section here, so it isn't duplicated. `DiagnosticEntry.tsx`
// the file is kept, not deleted, but is no longer imported/rendered by
// this page; `Hero.tsx` now owns an inline version of the same
// interaction and safety boundary.
//
// Retired from the homepage (files kept, not deleted — no project-scoped
// git history to recover them from if that turns out to be wrong; see
// the report): ModusExperience.tsx (consolidated into
// ModusProcessSection — same "observe/act/measure" story, now told once,
// at the six-stage canonical resolution instead of a shorter four-stage
// version), EngagementTeaser.tsx (consolidated into PricingPreview,
// which shows real plan pricing instead of just a loop label + link),
// Philosophy.tsx and ProofSection.tsx (evolved in place into
// WhatModusSees.tsx and CasesPreview.tsx respectively — same real copy,
// richer treatment, new filenames because the framing changed enough to
// warrant it).
export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <CentralInsight />
        <ModusProcessSection />
        <WhatModusSees />
        <BusinessXRaySection />
        <CapabilitiesPreview />
        <CasesPreview />
        <PlatformTeaser />
        <PricingPreview />
        <FooterReveal lifting={<FinalCTA />} footer={<Footer />} />
      </main>
    </>
  );
}
