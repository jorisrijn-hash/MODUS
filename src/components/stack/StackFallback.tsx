"use client";

import { BracketFrame } from "@/components/ui/BracketFrame";
import { LogoTile } from "@/components/ui/Logo";
import { CATEGORY_IDS } from "@/lib/three/stackGeometry";
import { useDict } from "@/lib/i18n/context";

/**
 * The complete flat architecture diagram, in DOM.
 *
 * This is the specified fallback for below 1024px, reduced motion and
 * WebGL failure — a real, readable, fully-labelled diagram showing every
 * layer, not a thumbnail or a placeholder. It carries the same content and
 * the same frame language as the 3D scene; it simply does not animate.
 *
 * It is laid out in the same vertical order as the scene so someone who
 * sees this version and someone who sees the 3D version are looking at the
 * same diagram.
 */
export function StackFallback() {
  const dict = useDict();
  const d = dict.home.stack.diagram;

  return (
    <div className="mb-24 mt-12 flex flex-col gap-3 md:mt-16">
      <BracketFrame>
        <h3 className="font-serif text-[20px] text-ink md:text-[24px]">{d.heading.team}</h3>
        <p className="mt-1.5 text-[13px] text-muted">{d.support.team}</p>
      </BracketFrame>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="flex flex-1 flex-col gap-3">
          <BracketFrame>
            <h3 className="font-serif text-[20px] text-ink md:text-[24px]">
              {d.heading.improvements}
            </h3>
            <p className="mt-1.5 text-[13px] text-muted">{d.support.improvements}</p>
          </BracketFrame>
          <BracketFrame>
            <h3 className="font-serif text-[20px] text-ink md:text-[24px]">{d.heading.insight}</h3>
            <p className="mt-1.5 text-[13px] text-muted">{d.support.insight}</p>
          </BracketFrame>
        </div>

        <BracketFrame
          tone="active"
          className="flex items-center justify-center md:w-[34%] md:shrink-0"
        >
          <span className="flex flex-col items-center gap-4 py-6">
            <LogoTile className="h-14 w-14" />
            <span className="font-sans text-[13px] font-medium uppercase tracking-[0.18em]">
              {d.heading.identity}
            </span>
          </span>
        </BracketFrame>
      </div>

      {/* Five business categories — the deliberate MODUS adaptation of the
          reference's integration row. Not nine slots with four empty, and
          no third-party logo is shown or implied. */}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {CATEGORY_IDS.map((id) => (
          <BracketFrame as="li" key={id} className="text-center">
            <span className="text-[13px] font-medium text-ink">{d.heading[`category.${id}`]}</span>
          </BracketFrame>
        ))}
      </ul>

      <BracketFrame>
        <h3 className="font-serif text-[20px] text-ink md:text-[24px]">{d.heading.production}</h3>
        <p className="mt-1.5 text-[13px] text-muted">{d.support.production}</p>
      </BracketFrame>
    </div>
  );
}
