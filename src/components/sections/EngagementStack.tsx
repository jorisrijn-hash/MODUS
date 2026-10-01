"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { useDict } from "@/lib/i18n/context";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

function EngagementRow({
  item,
  open,
  onToggle,
  reducedMotion,
  expandLabel,
  collapseLabel,
}: {
  item: {
    id: string;
    title: string;
    benefit: string;
    status: string;
    detail: { heading?: string; items?: string[]; purpose?: string; note?: string };
  };
  open: boolean;
  onToggle: () => void;
  reducedMotion: boolean;
  expandLabel: string;
  collapseLabel: string;
}) {
  const panelId = useId();
  const hasDetail = Boolean(item.detail.items?.length || item.detail.purpose || item.detail.note);

  return (
    <div className="border-b border-line">
      <button
        type="button"
        onClick={hasDetail ? onToggle : undefined}
        aria-expanded={hasDetail ? open : undefined}
        aria-controls={hasDetail ? panelId : undefined}
        aria-label={hasDetail ? (open ? collapseLabel : expandLabel) + ": " + item.title : undefined}
        className={`flex w-full flex-col gap-2 py-6 text-left sm:flex-row sm:items-baseline sm:gap-6 ${
          hasDetail ? "cursor-pointer" : "cursor-default"
        }`}
      >
        <span className="font-mono text-[11px] text-muted sm:w-10 sm:shrink-0">{item.id}</span>
        <span className="flex-1">
          <span className="block text-[15px] font-medium text-ink">{item.title}</span>
          <span className="mt-1 block text-[13.5px] leading-relaxed text-muted">{item.benefit}</span>
        </span>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.1em] text-modus sm:text-right">
          {item.status}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && hasDetail && (
          <motion.div
            id={panelId}
            key="detail"
            initial={reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reducedMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.15 : 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-6 pl-0 sm:pl-16">
              {item.detail.heading && item.detail.items && (
                <>
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                    {item.detail.heading}
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5">
                    {item.detail.items.map((d) => (
                      <li key={d} className="text-[13.5px] text-graphite">
                        {d}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {item.detail.purpose && (
                <p className="mt-4 max-w-md text-[13.5px] leading-relaxed text-ink">{item.detail.purpose}</p>
              )}
              {item.detail.note && (
                <p className="mt-4 max-w-md text-[12.5px] leading-relaxed text-muted">{item.detail.note}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function EngagementStack() {
  const dict = useDict();
  const t = dict.pricing.engagementStack;
  const reducedMotion = usePrefersReducedMotion();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section id="engagement" className="border-b border-line py-20 md:py-28">
      <Container>
        <div className="max-w-xl">
          <Reveal>
            <SectionLabel>{t.label}</SectionLabel>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 text-balance text-display-sm font-semibold text-ink">{t.heading}</h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-graphite">{t.body}</p>
          </Reveal>
        </div>

        <div className="mt-12 border-t border-line">
          {t.items.map((item, i) => (
            <Reveal key={item.id} delay={Math.min(i * 0.03, 0.24)}>
              <EngagementRow
                item={item}
                open={openId === item.id}
                onToggle={() => setOpenId((cur) => (cur === item.id ? null : item.id))}
                reducedMotion={reducedMotion}
                expandLabel={t.expand}
                collapseLabel={t.collapse}
              />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mx-auto mt-12 max-w-lg text-center text-[15px] font-medium text-ink">{t.closingLine}</p>
        </Reveal>
      </Container>
    </section>
  );
}
