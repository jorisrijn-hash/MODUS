"use client";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { TextReveal } from "@/components/ui/TextReveal";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { DiagnosticCTA } from "@/components/ui/DiagnosticCTA";
import { openChatbot, track } from "@/lib/chatbot";
import { useDict } from "@/lib/i18n/context";

/**
 * Checkpoint 4, Section 16 — same real copy as before (`dict.finalCTA`,
 * unchanged strings: "What would MODUS find in your business?" already
 * reads almost verbatim like the brief's own suggested "Find what could
 * work better" direction, so it's kept rather than replaced). Restyled:
 * oversized centered headline (`display-lg`), the primary CTA now goes
 * through `DiagnosticCTA`'s `dark` variant (fixed `inverted-foreground`
 * tokens, not the theme-relative `paper` the old version used — see
 * MODUS_REDESIGN_REPORT.md's Checkpoint 3 entry for why that distinction
 * matters on an always-accent-colored section).
 */
export function FinalCTA() {
  const dict = useDict();
  const t = dict.finalCTA;
  return (
    <section id="final-cta" className="border-t border-line bg-modus py-28 text-modus-foreground md:py-36">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-modus-foreground/60">{t.label}</p>
          </Reveal>
          <TextReveal
            as="h2"
            delay={0.06}
            text={t.heading}
            className="mt-5 block text-balance text-display-md font-semibold md:text-display-lg"
          />
          <Reveal delay={0.16}>
            <p className="mx-auto mt-6 max-w-md text-[16px] leading-relaxed text-modus-foreground/75">{t.body}</p>
          </Reveal>

          <Reveal delay={0.22}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
              <MagneticButton>
                <DiagnosticCTA variant="accent-invert" source="final_cta" />
              </MagneticButton>
              <button
                type="button"
                onClick={() => {
                  track("talk_to_modus_click", { source: "final_cta" });
                  openChatbot();
                }}
                className="text-[14px] font-medium text-modus-foreground/85 underline decoration-modus-foreground/30 underline-offset-4 hover:text-modus-foreground"
              >
                {t.ctaSecondary}
              </button>
            </div>
          </Reveal>
          <Reveal delay={0.28}>
            <p className="mt-6 text-[12.5px] text-modus-foreground/60">{t.footnote}</p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
