import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ThemeSwitch } from "@/components/ui/ThemeSwitch";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { NumberTicker } from "@/components/ui/NumberTicker";
import { Reveal } from "@/components/ui/Reveal";
import { MotionLabScrollProvider } from "@/components/motion-lab/MotionLabScrollProvider";
import { MorphExample } from "@/components/motion-lab/MorphExample";
import { PinnedSequenceDemo } from "@/components/motion-lab/PinnedSequenceDemo";
import { GsapRevealDemo } from "@/components/motion-lab/GsapRevealDemo";
import { FluidFieldDemo } from "@/components/motion-lab/FluidFieldDemo";
import { ImageBulgeDemo } from "@/components/motion-lab/ImageBulgeDemo";
import { ImageRevealDemo } from "@/components/motion-lab/ImageRevealDemo";

// Temporary internal surface for the Checkpoint 2 motion/WebGL spike —
// same convention as /design-system: not linked, not indexed, validation
// only, not a preview of final homepage composition (Section 1/17).
export const metadata: Metadata = {
  title: "MODUS — Motion Lab (internal)",
  robots: { index: false, follow: false },
};

export default function MotionLabPage() {
  return (
    <MotionLabScrollProvider>
      <div className="min-h-screen bg-paper pb-[60vh] pt-16 text-ink">
        <Container>
          <div className="flex flex-col gap-3 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
            <SectionLabel id="INTERNAL">MODUS Motion Lab — Checkpoint 2</SectionLabel>
            <ThemeSwitch />
          </div>
          <p className="mt-4 max-w-xl text-[13px] text-muted">
            Validation surface only — not a preview of the real homepage. Scroll
            to exercise Lenis + ScrollTrigger; toggle theme while effects are
            active; try reduced motion at the OS level and reload.
          </p>
          <a href="#fluid-field-section" className="mt-2 inline-block text-[12px] text-modus underline">
            Jump to fluid field (anchor-link test)
          </a>

          {/* Reveal (Motion) */}
          <section className="mt-16">
            <SectionLabel id="01">Reveal — Motion (opacity + translate, and + blur)</SectionLabel>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Reveal className="rounded-lg border border-line bg-paper p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">Reveal (default)</p>
                <p className="mt-2 text-[14px] text-graphite">Existing behavior — every current call site, unchanged.</p>
              </Reveal>
              <Reveal blur className="rounded-lg border border-line bg-paper p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">Reveal (blur, new)</p>
                <p className="mt-2 text-[14px] text-graphite">Opt-in blur→focus variant added this checkpoint.</p>
              </Reveal>
            </div>
          </section>

          {/* GSAP reveal + drift */}
          <section className="mt-16">
            <SectionLabel id="02">GSAP + ScrollTrigger — reveal, drift</SectionLabel>
            <div className="mt-6">
              <GsapRevealDemo />
            </div>
          </section>

          {/* Pinned sequence */}
          <section className="mt-16">
            <SectionLabel id="03">Pinned sequence (GSAP, scroll-scrubbed)</SectionLabel>
            <div className="mt-6">
              <PinnedSequenceDemo />
            </div>
          </section>

          {/* Morph */}
          <section className="mt-16">
            <SectionLabel id="04">Morph — prefer morphing over appearing</SectionLabel>
            <div className="mt-6">
              <MorphExample />
            </div>
          </section>

          {/* Magnetic + Count (existing primitives, reused) */}
          <section className="mt-16">
            <SectionLabel id="05">Magnetic + Count (existing primitives, reused as-is)</SectionLabel>
            <div className="mt-6 flex items-center gap-8">
              <MagneticButton>
                <button type="button" className="rounded bg-modus px-5 py-2.5 text-[13px] font-medium text-modus-foreground">
                  Magnetic CTA
                </button>
              </MagneticButton>
              <NumberTicker value={2840} prefix="+€" className="text-display-sm font-semibold text-modus" />
            </div>
          </section>

          {/* Fluid field */}
          <section id="fluid-field-section" className="mt-16 scroll-mt-24">
            <SectionLabel id="06">WebGL fluid field — Raw WebGL2 vs React Three Fiber</SectionLabel>
            <div className="mt-6">
              <FluidFieldDemo />
            </div>
          </section>

          {/* Image bulge */}
          <section className="mt-16">
            <SectionLabel id="07">Image bulge / distortion (shares the fluid field&apos;s WebGL2 infra)</SectionLabel>
            <div className="mt-6">
              <ImageBulgeDemo />
            </div>
          </section>

          {/* Image reveal */}
          <section className="mt-16">
            <SectionLabel id="08">Image reveal (GSAP clip-path wipe + scale settle, Lenis-synced)</SectionLabel>
            <div className="mt-6">
              <ImageRevealDemo />
            </div>
          </section>

          <section className="mt-16 border-t border-line pt-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
              End of test surface — scroll back up to re-trigger reveals is not
              expected (once: true, by design, matching existing Reveal
              behavior elsewhere in the codebase).
            </p>
          </section>
        </Container>
      </div>
    </MotionLabScrollProvider>
  );
}
