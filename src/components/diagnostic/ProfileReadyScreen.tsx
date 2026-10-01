"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useDict } from "@/lib/i18n/context";
import type { CustomerContextSummary } from "@/lib/customerContext/types";

/**
 * What a returning visitor with a stored profile reference sees at
 * /diagnostic instead of the generic intro — a lightweight summary, not a
 * reconstruction of the full ResultView (which needs the raw answers this
 * deliberately doesn't re-fetch; see CustomerContextSummary's own comment).
 */
export function ProfileReadyScreen({
  companyName,
  summary,
  status,
  onStartNew,
}: {
  companyName: string | null;
  summary: CustomerContextSummary | null;
  status: "idle" | "loading" | "ready" | "error";
  onStartNew: () => void;
}) {
  const dict = useDict();
  const t = dict.diagnosticShell.profileReady;

  return (
    <Container className="grid grid-cols-1 items-center gap-14 py-16 lg:grid-cols-2 lg:py-24">
      <div>
        <Reveal>
          <SectionLabel id="SYS / 09">
            {companyName ? `${companyName.toUpperCase()} / ${t.label}` : t.label}
          </SectionLabel>
        </Reveal>

        {status === "loading" || status === "idle" ? (
          <Reveal delay={0.06}>
            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.1em] text-muted">{t.loading}</p>
          </Reveal>
        ) : status === "error" || !summary ? (
          <Reveal delay={0.06}>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-graphite">{t.unavailable}</p>
            <div className="mt-6">
              <MagneticButton>
                <button
                  type="button"
                  onClick={onStartNew}
                  className="inline-flex items-center gap-2 rounded bg-modus px-6 py-3.5 text-[14px] font-medium text-paper hover:bg-modus-light"
                >
                  {t.startNew}
                  <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </MagneticButton>
            </div>
          </Reveal>
        ) : (
          <>
            <Reveal delay={0.06}>
              <h1 className="mt-6 text-balance text-display-md font-semibold text-ink">
                {summary.signalsCount > 0 ? t.signalsIdentified(summary.signalsCount) : t.profileReadyTitle}
              </h1>
            </Reveal>
            {summary.estimate && (
              <Reveal delay={0.12}>
                <p className="mt-5 max-w-md text-[15px] leading-relaxed text-graphite">{t.estimateAvailable}</p>
              </Reveal>
            )}

            <Reveal delay={0.2}>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <MagneticButton>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 rounded bg-modus px-6 py-3.5 text-[14px] font-medium text-paper transition-colors hover:bg-modus-light"
                  >
                    {t.viewPricing}
                    <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                  </Link>
                </MagneticButton>
                <button
                  type="button"
                  onClick={onStartNew}
                  className="text-[13px] text-graphite hover:text-ink"
                >
                  {t.startNew}
                </button>
              </div>
            </Reveal>
            <Reveal delay={0.26}>
              <p className="mt-4 max-w-md text-[11.5px] text-muted">{t.startNewNote}</p>
            </Reveal>
          </>
        )}
      </div>
    </Container>
  );
}
