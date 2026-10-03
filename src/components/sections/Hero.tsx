"use client";

import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { DiagnosticCTA } from "@/components/ui/DiagnosticCTA";
import { AnimatedChars } from "@/components/ui/AnimatedChars";
import { HomeContextBanner } from "@/components/customerContext/HomeContextBanner";
import { HeroScene } from "@/components/hero/HeroScene";
import { useDict, useLocale } from "@/lib/i18n/context";

/**
 * Hero, rebuilt for the Antimetal composition.
 *
 * Structure is the measured reference, not the previous MODUS hero:
 * eyebrow → two-line serif headline → lead → one primary action and one
 * quiet secondary → a large point-cloud scene anchored to the right of the
 * copy on desktop, and beneath it on mobile.
 *
 * What left, and why:
 * - The fluid field behind everything is gone. The scene is now the one
 *   focal object; an ambient wash behind it would compete with it.
 * - The inline diagnostic entry form (text input + category chips) moved
 *   back out to its own `DiagnosticEntry` section on the homepage. The
 *   reference hero carries copy and actions only, and keeping a form here
 *   is what previously pushed the composition away from it. Nothing is
 *   lost: that component still owns the `?hint=` entry-context behaviour
 *   end to end, and its Playwright coverage follows it.
 *
 * Input safety over the canvas: the scene sits in its own stacking layer
 * with `pointer-events-none` on the decorative overscan, and the copy
 * column sits above it. Drag-to-rotate works on the canvas; the CTAs stay
 * clickable; vertical page scrolling on touch is never captured. The
 * 417×400 desktop / full-width 280px mobile anchor is a real laid-out
 * element — the canvas overscans around it, so the sphere stays beside the
 * headline while dots can drift into the background.
 */
export function Hero() {
  const dict = useDict();
  const { locale } = useLocale();
  const t = dict.home.hero;

  return (
    <section
      id="hero"
      /*
       * Full viewport, edge to edge.
       *
       * `min-h-svh`, not `h-screen`: the small-viewport unit is stable
       * while mobile browser chrome shows and hides, so the hero does not
       * resize under the reader mid-scroll. And `min-h`, not `h`, so the
       * section is allowed to GROW — at short window heights, 200% browser
       * zoom or large text the content pushes the section taller instead
       * of the CTA being cropped to force an exact viewport height.
       *
       * The dock is a fixed 80px header, so the top padding clears it
       * rather than letting the eyebrow slide underneath. Safe-area insets
       * keep the scroll cue clear of a home indicator.
       */
      className="relative flex min-h-svh flex-col overflow-hidden pb-[calc(5rem+env(safe-area-inset-bottom))] pt-32 md:pt-40"
    >
      <Container className="flex flex-1 flex-col justify-center">
        <div className="flex flex-col gap-14 lg:flex-row lg:items-center lg:gap-[calc(64*var(--sf))]">
          {/* Copy column. */}
          <div className="relative z-10 max-w-hero-text flex-1">
            <Reveal>
              <p className="font-mono text-label uppercase text-muted">{t.label}</p>
            </Reveal>

            {/*
             * Deliberately NOT wrapped in `Reveal`. The masked line reveal
             * is this heading's entrance; layering `Reveal`'s opacity-plus-
             * translate on the outer box as well would fade the whole
             * heading in while its lines were still rising out of their
             * masks — two entrances fighting, and the mask effect lost
             * behind the fade. The brief is explicit that a simple opacity
             * fade or whole-heading translation does not satisfy this.
             *
             * The explicit per-line spans are kept: they carry the intended
             * two-line break at the design viewport. SplitText measures the
             * rendered lines, so it splits along these same breaks rather
             * than re-flowing the headline.
             */}
            <h1
              // Keyed by locale so a language switch REPLACES this
              // element rather than patching its children.
              //
              // SplitText reparents the spans below into line and mask
              // wrappers. React still believes they are direct children of
              // the <h1>, so when the dictionary changes it calls
              // removeChild on the <h1> for a node that now lives inside a
              // mask div, and the page crashes with "The node to be
              // removed is not a child of this node". Observed as a real
              // Next.js runtime error during the EN→NL→EN smoke test.
              //
              // With a key, React unmounts the whole <h1> — which IS still
              // a child of its own parent — and mounts a fresh one for the
              // new language, which the provider then re-splits.
              key={locale}
              data-split="heading"
              className="mt-6 font-serif text-display-hero font-normal text-ink"
            >
              {t.headlineLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>

            <Reveal delay={0.16}>
              <p className="mt-7 max-w-hero-lead font-serif text-lead text-graphite">{t.body}</p>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <DiagnosticCTA variant="hero" source="hero" magnetic />
                {/* Secondary action uses the technical bracket language
                    rather than a second pill, so there is one obvious
                    primary. */}
                <Link
                  href="/how-it-works"
                  // Secondary text button: character roll, no background
                  // layer — it is a bordered outline, not a filled surface.
                  data-chars-root=""
                  className="relative inline-flex items-center rounded-full border border-dashed border-line-strong/60 px-6 py-3.5 text-[14px] text-graphite transition-colors duration-200 ease-modus hover:border-line-strong hover:text-ink"
                >
                  <AnimatedChars text={t.ctaSecondary} />
                </Link>
              </div>
            </Reveal>

            <HomeContextBanner />
          </div>

          {/* Scene anchor. Measured: 417×400 desktop, full-width 280px
              mobile. `HeroScene` reads this element's box with a
              ResizeObserver and overscans its canvas around that centre. */}
          <div className="relative w-full lg:w-[calc(417*var(--sf))] lg:shrink-0">
            <HeroScene
              className="h-[280px] w-full lg:h-[calc(400*var(--sf))]"
              bubbles={t.sceneBubbles}
              bubblesNote={t.sceneBubblesNote}
            />
          </div>
        </div>
      </Container>

      {/*
       * Scroll cue. A real anchor to the next section, not a decorative
       * glyph: it has a genuine hit area, a visible focus ring and works
       * from the keyboard. It does not capture or hijack scroll — the
       * browser handles the jump, and the shared Lenis controller smooths
       * it like any other in-page anchor.
       */}
      <a
        href="#manifesto"
        className="group absolute inset-x-0 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] z-10 mx-auto flex w-fit flex-col items-center gap-2 px-4 py-2 text-muted transition-colors duration-200 ease-modus hover:text-ink"
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.14em]">{t.scrollCue}</span>
        <ArrowDown
          className="h-4 w-4 motion-safe:animate-[nudge_2.4s_ease-in-out_infinite]"
          strokeWidth={1.5}
        />
      </a>
    </section>
  );
}
