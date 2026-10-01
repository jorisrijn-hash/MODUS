"use client";

import { useMemo } from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/**
 * Per-character label for the stagger effect in
 * `Button with CSS Character Stagger.pdf`.
 *
 * The PDF splits by rewriting `innerHTML` on DOMContentLoaded. That is the
 * right shape for a static page and the wrong one here: mutating children
 * underneath React fights reconciliation, and a remount or a translation
 * change would split an already-split label again — which the brief rules
 * out explicitly. Rendering the spans from React makes repeat splitting
 * structurally impossible, and the resulting DOM, CSS and timing are
 * identical to the PDF's.
 *
 * Accessibility: the character spans are decorative and carry
 * `aria-hidden`, with the real label alongside them in a visually hidden
 * span. Without that, a screen reader can announce a split label one
 * letter at a time. The control therefore still has exactly one
 * accessible name, and it is the real, translated text.
 */

/**
 * Grapheme-safe segmentation. Splitting on code units (or even code
 * points) tears apart combining accents and composed emoji — "é" written
 * as e + U+0301 would animate as two characters, one of which is a bare
 * accent. `Intl.Segmenter` keeps a user-perceived character together.
 */
function toGraphemes(text: string): string[] {
  if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(segmenter.segment(text), (s) => s.segment);
  }
  // Array.from iterates code points, which still beats splitting on "".
  return Array.from(text);
}

export function AnimatedChars({
  text,
  className = "",
}: {
  /** Plain string only — the accessible name depends on it. */
  text: string;
  className?: string;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const graphemes = useMemo(() => toGraphemes(text), [text]);

  // Reduced motion gets ordinary text: no split, no duplicate spans, no
  // hidden label. Nothing to neutralise later.
  if (reducedMotion) {
    return <span className={className}>{text}</span>;
  }

  return (
    <>
      <span data-animate-chars className={className} aria-hidden="true">
        {graphemes.map((grapheme, index) => (
          <span
            key={`${index}-${grapheme}`}
            style={{
              // The PDF's offsetIncrement: 0.01s per character.
              transitionDelay: `${index * 0.01}s`,
              // A collapsed space would close the gaps between words as
              // soon as each character becomes its own inline-block.
              whiteSpace: grapheme === " " ? "pre" : undefined,
            }}
          >
            {grapheme}
          </span>
        ))}
      </span>
      <span className="sr-only">{text}</span>
    </>
  );
}
