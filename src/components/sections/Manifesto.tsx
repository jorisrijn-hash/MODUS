"use client";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { useDict } from "@/lib/i18n/context";

/**
 * The manifesto: five centred serif lines, supplied verbatim.
 *
 * The five-line break is the composition, so each line is its own block
 * rather than one paragraph the browser re-wraps. On mobile the lines are
 * allowed to wrap naturally — forcing five hard lines at 390px would
 * either shrink the type below readability or overflow — but the five
 * logical statements stay separate blocks, so the rhythm survives even
 * when a line takes two visual rows.
 *
 * Replaces `CentralInsight`, which told a shortened two-line version of
 * this same idea.
 */
export function Manifesto() {
  const dict = useDict();
  const lines = dict.home.manifesto.lines;

  return (
    // `id` is the hero scroll cue's anchor target.
    <section id="manifesto" className="scroll-mt-24 py-28 md:py-40">
      <Container>
        <div className="mx-auto max-w-[calc(900*var(--sf))] text-center">
          {lines.map((line, i) => (
            <Reveal key={line} delay={i * 0.08}>
              <p
                className={`font-serif text-display-sub ${
                  // The closing couplet carries the MODUS claim; the first
                  // three set up the problem. Weighting them differently is
                  // what stops five centred lines reading as a block of
                  // undifferentiated copy.
                  i >= 3 ? "text-ink" : "text-graphite"
                }`}
              >
                {line}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
