"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { TextReveal } from "@/components/ui/TextReveal";
import { Reveal } from "@/components/ui/Reveal";
import { useDict } from "@/lib/i18n/context";

export function CentralInsight() {
  const dict = useDict();
  const t = dict.home.centralInsight;
  return (
    <section className="border-t border-line py-28 md:py-40">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <TextReveal
            as="h2"
            text={t.headline1}
            className="block text-balance text-display-sm font-semibold text-ink md:text-display-md"
          />
          <TextReveal
            as="h2"
            delay={0.12}
            text={t.headline2}
            className="mt-2 block text-balance text-display-sm font-semibold text-muted md:text-display-md"
          />

          <Reveal delay={0.4}>
            <p className="mx-auto mt-8 max-w-md text-[15px] leading-relaxed text-graphite">
              {t.body}
            </p>
          </Reveal>

          <Reveal delay={0.48}>
            <Link
              href="/how-it-works"
              className="group mt-8 inline-flex items-center gap-1.5 text-[14px] font-medium text-ink"
            >
              {t.link}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 ease-modus group-hover:translate-x-0.5"
                strokeWidth={1.75}
              />
            </Link>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
