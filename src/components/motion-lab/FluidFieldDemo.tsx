"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import type { FluidSimGL } from "@/lib/webgl/fluidSimGL";

// WebGL/canvas-dependent — dynamically imported with ssr:false so it
// never becomes part of any route's server-rendered or initial
// synchronous client bundle. FluidFieldRawGL itself now lives in
// src/components/motion/ (shared, production-usable), not this
// motion-lab/ directory — moved in Checkpoint 3 when the marketing shell
// started using it for real, per Section 22's instruction to keep lab
// code from leaking into production and vice versa.
const FluidFieldRawGL = dynamic(
  () => import("@/components/motion/FluidFieldRawGL").then((m) => m.FluidFieldRawGL),
  { ssr: false }
);

/**
 * Raw WebGL2 fluid field demo surface.
 *
 * Checkpoint 5.5 (third pass): the per-element hover states this demo
 * was originally built for (idle / hover-cta / hover-text / hover-media,
 * from Checkpoint 2's Section 8) no longer exist. They belonged to the
 * old procedural blob shader, where "state" just scaled one blob's
 * radius. The field is now a real incompressible-fluid simulation
 * (`fluidSimGL.ts`) whose behaviour comes from velocity/dye/pressure
 * fields reacting to actual pointer motion — there is no radius knob to
 * swap per hovered element, so those hooks were removed rather than
 * faked. The demo keeps the same elements as hover targets so the
 * *fluid's* response to a pointer crossing different parts of the
 * composition can still be eyeballed here.
 */
export function FluidFieldDemo() {
  const fieldRef = useRef<FluidSimGL | null>(null);

  return (
    <div className="relative h-[360px] overflow-hidden rounded-lg border border-line bg-mineral">
      <FluidFieldRawGL fieldRef={fieldRef} />

      <div className="relative flex h-full flex-col items-center justify-center gap-6 p-8">
        <p className="max-w-xs text-center text-[13px] text-graphite">
          Move the pointer across this panel — the field should displace existing material and settle
          slowly, rather than drawing a trail.
        </p>
        <div className="flex h-20 w-32 items-center justify-center rounded border border-line bg-paper font-mono text-[10px] uppercase text-muted">
          media
        </div>
        <button
          type="button"
          className="rounded bg-modus px-4 py-2 text-[13px] font-medium text-modus-foreground"
        >
          CTA
        </button>
      </div>
    </div>
  );
}
