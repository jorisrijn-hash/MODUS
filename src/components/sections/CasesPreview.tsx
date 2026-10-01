"use client";

import { useRef } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { NumberTicker } from "@/components/ui/NumberTicker";
import { useImageReveal } from "@/lib/motion/useImageReveal";
import { useDict } from "@/lib/i18n/context";

/**
 * Evolves `ProofSection.tsx` into a homepage Cases preview — Section 11.
 * Same real content (`dict.home.proofSection`, untouched — including its
 * explicit "Illustrative example" context line, kept honest per the
 * brief's own instruction not to fabricate results). Gets the Checkpoint
 * 2 GSAP image-reveal treatment (`useImageReveal`) on its `MediaFrame`
 * placeholder, and the metrics now count up (`NumberTicker`, an existing
 * primitive already used elsewhere — reused, not rebuilt) instead of
 * appearing statically. `bg-white` → `bg-paper` fixed along the way (a
 * pre-existing token-bypass this checkpoint's own rewrite of this section
 * naturally touches, not a separate unscoped fix).
 */
export function CasesPreview() {
  const dict = useDict();
  const t = dict.home.proofSection;
  const mediaRef = useRef<HTMLDivElement>(null);
  useImageReveal(mediaRef);

  return (
    <section className="border-t border-line py-24 md:py-32">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal>
              <SectionLabel id="SYS / 06">{t.label}</SectionLabel>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="mt-5 text-balance text-display-sm font-semibold text-ink">{t.heading}</h2>
            </Reveal>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-stretch lg:gap-12">
          <div ref={mediaRef} style={{ clipPath: "inset(0% 0% 0% 0%)" }}>
            {/* lg:h-full only — below lg the grid is single-column (no
                stretch to match), so aspect-video alone correctly derives
                height from the now-width-constrained box; at lg the grid
                column's own stretch height coexists fine with aspect-video
                since both width and height are explicit there, so the
                browser doesn't need to compute either from the ratio. */}
            <MediaFrame label={t.context} aspect="video" className="lg:h-full">
              <div className="h-full bg-mineral" />
            </MediaFrame>
          </div>

          <div className="flex flex-col justify-between rounded-md border border-line bg-paper p-6 sm:p-8">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">{t.context}</p>
              <p className="mt-3 max-w-md text-[14.5px] leading-relaxed text-graphite">{t.body}</p>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-line pt-6">
              {t.metrics.map((m) => {
                const numeric = parseFloat(m.value.replace(/[^\d.]/g, ""));
                const prefix = m.value.match(/^[^\d]*/)?.[0] ?? "";
                const suffix = m.value.match(/[^\d]*$/)?.[0] ?? "";
                return (
                  <div key={m.label}>
                    <p className="text-xl font-semibold text-ink md:text-2xl">
                      {Number.isFinite(numeric) ? (
                        <NumberTicker value={numeric} prefix={prefix} suffix={suffix} />
                      ) : (
                        m.value
                      )}
                    </p>
                    <p className="mt-1 text-[11.5px] text-muted">{m.label}</p>
                  </div>
                );
              })}
            </div>

            <Link
              href="/results"
              className="group mt-6 inline-flex items-center gap-1.5 text-[14px] font-medium text-ink"
            >
              {t.link}
              <span className="transition-transform duration-200 ease-modus group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
