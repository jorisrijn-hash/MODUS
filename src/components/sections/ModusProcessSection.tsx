"use client";

import { useRef } from "react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { usePinnedSequence } from "@/lib/motion/gsapHooks";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { useDict } from "@/lib/i18n/context";

/**
 * The homepage's signature section — Checkpoint 4, Section 8. Built on
 * the proven Checkpoint 2 `usePinnedSequence` GSAP primitive (no new
 * one-off animation architecture, per Section 18). One stage dominant at
 * a time: the active stage's number/heading is large and its surface
 * inverts to near-black (the "active surface inversion" the brief asks
 * for); the others recede as thin index rows down the left, muted. A
 * vertical progress line fills as the pinned scroll advances, doubling as
 * a timeline indicator. This is morphing, not six cards appearing in
 * sequence: every stage's DOM node exists from the start, and the
 * timeline only ever animates opacity/scale/color on the *same* six
 * nodes as the active index changes — nothing unmounts and remounts.
 *
 * Content: reuses the six-stage MODUS loop concept, but with the exact
 * canonical labels this checkpoint's own brief (and the original V2
 * master brief) name it by — OBSERVE / DIAGNOSE / PRIORITIZE / IMPLEMENT
 * / MEASURE / IMPROVE — which differs slightly from `/how-it-works`'
 * existing "Observe / Understand / Prioritize / Intervene / Measure /
 * Improve" wording (that page's interior is untouched this checkpoint,
 * per Section 25). A deliberate, documented terminology choice, not an
 * inconsistency introduced by accident — see the report.
 */
export function ModusProcessSection() {
  const dict = useDict();
  const t = dict.home.process;
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  usePinnedSequence(
    containerRef,
    (tl) => {
      t.stages.forEach((_, i) => {
        if (i > 0) {
          // Fully transparent, not just dimmed — these panels are all
          // absolutely positioned on top of each other (same spot, for
          // the "one composition transforming into the next" morph
          // quality), so a merely-dimmed outgoing panel's text visibly
          // ghosts through the incoming one at a different length/
          // position. A real bug caught by actually looking at a
          // screenshot mid-transition, not assumed correct from the
          // GSAP timeline alone. A small upward drift on exit/entrance
          // keeps the "carry-over motion" quality (Section 17) without
          // the overlap.
          tl.to(`[data-stage-panel="${i - 1}"]`, { opacity: 0, y: -16, duration: 0.35 }, i);
          tl.to(`[data-stage-index="${i - 1}"]`, { opacity: 0.4, duration: 0.4 }, i);
          tl.fromTo(
            `[data-stage-panel="${i}"]`,
            { y: 16 },
            { y: 0, duration: 0.35 },
            i
          );
        }
        tl.to(`[data-stage-panel="${i}"]`, { opacity: 1, duration: 0.4 }, i);
        tl.to(`[data-stage-index="${i}"]`, { opacity: 1, duration: 0.4 }, i);
        tl.to("[data-progress-fill]", { scaleY: (i + 1) / t.stages.length, duration: 0.4 }, i);
      });
    },
    { end: `+=${t.stages.length * 90}%` }
  );

  if (reducedMotion) {
    return (
      <section className="border-t border-line bg-inverted py-24 text-inverted-foreground md:py-32">
        <Container>
          <Reveal>
            <SectionLabel id="SYS / 03">{t.label}</SectionLabel>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 max-w-lg text-balance text-display-sm font-semibold md:text-display-md">
              {t.heading}
            </h2>
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {t.stages.map((stage, i) => (
              <Reveal key={stage.id} delay={0.04 * i}>
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-modus-light">
                  {String(i + 1).padStart(2, "0")} / {stage.id}
                </p>
                <h3 className="mt-2 text-xl font-semibold">{stage.heading}</h3>
                <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-inverted-foreground/70">
                  {stage.body}
                </p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      className="relative border-t border-line bg-inverted text-inverted-foreground"
    >
      <div className="flex h-screen items-center overflow-hidden">
        <Container className="w-full">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[280px_1fr] lg:gap-20">
            {/* Left: label + index rail with progress line */}
            <div>
              <SectionLabel id="SYS / 03" tone="on-dark">
                {t.label}
              </SectionLabel>
              <p className="mt-4 max-w-[220px] text-[13px] leading-relaxed text-inverted-foreground/60">
                {t.body}
              </p>

              <div className="relative mt-10 flex gap-4">
                <div className="relative w-px shrink-0 bg-inverted-foreground/15">
                  <div
                    data-progress-fill
                    style={{ transformOrigin: "top" }}
                    className="absolute inset-x-0 top-0 h-full origin-top scale-y-0 bg-modus-light"
                  />
                </div>
                <ol className="space-y-5">
                  {t.stages.map((stage, i) => (
                    <li
                      key={stage.id}
                      data-stage-index={i}
                      className="font-mono text-[11px] uppercase tracking-[0.1em] text-inverted-foreground/40"
                      style={{ opacity: i === 0 ? 1 : 0.4 }}
                    >
                      {String(i + 1).padStart(2, "0")} / {stage.id}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Right: the six stacked panels — same nodes throughout, only
                opacity/scale change as the active index advances */}
            <div className="relative h-[280px]">
              {t.stages.map((stage, i) => (
                <div
                  key={stage.id}
                  data-stage-panel={i}
                  className="absolute inset-0 flex flex-col justify-center"
                  style={{ opacity: i === 0 ? 1 : 0, transform: i === 0 ? "translateY(0)" : "translateY(16px)" }}
                >
                  <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-modus-light">
                    {String(i + 1).padStart(2, "0")} / {t.stages.length.toString().padStart(2, "0")}
                  </p>
                  <h3 className="mt-4 text-display-md font-semibold">{stage.heading}</h3>
                  <p className="mt-5 max-w-md text-[16px] leading-relaxed text-inverted-foreground/70">
                    {stage.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
