"use client";

import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { FieldPhoto } from "@/components/ui/FieldPhoto";
import { useDict } from "@/lib/i18n/context";

const photoIds = ["OBS / 011", "OBS / 012", "OBS / 013"];

export function HumanPresence() {
  const dict = useDict();
  const t = dict.company.humanPresence;
  return (
    <section className="border-b border-line py-24 md:py-32">
      <Container>
        <div className="max-w-lg">
          <Reveal>
            <SectionLabel id="SYS / 08">{t.label}</SectionLabel>
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

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {t.photoCaptions.map((caption, i) => (
            <Reveal key={photoIds[i]} delay={i * 0.06}>
              <FieldPhoto id={photoIds[i]} caption={caption} aspect="aspect-[3/4]" />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
