"use client";

import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { FieldPhoto } from "@/components/ui/FieldPhoto";
import { useDict } from "@/lib/i18n/context";

const stageMeta = [
  { id: "01", obs: "OBS / 01" },
  { id: "02", obs: "OBS / 02" },
  { id: "03", obs: "OBS / 03" },
  { id: "04", obs: "OBS / 04" },
];

export function ModusExperience() {
  const dict = useDict();
  const t = dict.home.modusExperience;
  const stages = t.stages.map((s, i) => ({ ...stageMeta[i], ...s }));
  return (
    <section className="border-t border-line py-24 md:py-32">
      <Container>
        <div className="max-w-xl">
          <Reveal>
            <SectionLabel id="SYS / 03">{t.label}</SectionLabel>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 text-balance text-display-sm font-semibold text-ink">
              {t.heading}
            </h2>
          </Reveal>
        </div>

        <div className="mt-16 space-y-20 md:space-y-28">
          {stages.map((stage, i) => (
            <Reveal key={stage.id}>
              <div
                className={`grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-16 ${
                  i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                <FieldPhoto id={stage.obs} caption={stage.caption} aspect="aspect-[4/3]" />
                <div>
                  <p className="font-mono text-[11px] text-muted">{stage.id}</p>
                  <h3 className="mt-3 text-2xl font-semibold text-ink md:text-3xl">
                    {stage.title}
                  </h3>
                  <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-graphite">
                    {stage.copy}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
