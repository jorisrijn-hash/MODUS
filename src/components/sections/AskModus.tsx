"use client";

import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { useDict } from "@/lib/i18n/context";

export function AskModus() {
  const dict = useDict();
  const t = dict.platform.askModus;
  return (
    <section className="border-t border-line py-24 md:py-32">
      <Container>
        <div className="max-w-xl">
          <Reveal>
            <SectionLabel id="SYS / 06">{t.label}</SectionLabel>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 text-balance text-display-sm font-semibold text-ink">
              {t.heading}
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-5 text-[15px] leading-relaxed text-graphite">
              {t.body}
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.18} className="mt-10">
          <div className="relative max-w-xl rounded-md border border-line bg-white">
            <div className="reg-mark -left-1 -top-1" />
            <div className="reg-mark -right-1 -top-1" />
            <div className="reg-mark -bottom-1 -left-1" />
            <div className="reg-mark -bottom-1 -right-1" />

            <div className="border-b border-line px-5 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                {t.headerLabel}
              </p>
            </div>

            <div className="space-y-4 p-5">
              <div className="ml-auto max-w-[80%] rounded-sm bg-mineral px-4 py-2.5">
                <p className="text-[13.5px] text-ink">
                  {t.question}
                </p>
              </div>

              <div className="max-w-[85%] rounded-sm border border-line px-4 py-3">
                <p className="text-[13.5px] leading-relaxed text-graphite">
                  {t.answer}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-sm border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.06em] text-graphite">
                    {t.viewSignal}
                  </span>
                  <span className="rounded-sm border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.06em] text-graphite">
                    {t.openFormAnalysis}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
