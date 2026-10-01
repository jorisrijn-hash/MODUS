"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const FluidFieldRawGL = dynamic(
  () => import("@/components/motion/FluidFieldRawGL").then((m) => m.FluidFieldRawGL),
  { ssr: false }
);

/**
 * Checkpoint 3, Section 9 introduced this at a flat, deliberately
 * restrained 7% opacity everywhere ("the system is present and correct,"
 * not "the final hero effect is finished" — that was explicitly deferred
 * to Checkpoint 4). Checkpoint 4's own report flagged it as unchanged and
 * likely underpowered specifically behind the hero; Checkpoint 5 approved
 * a narrowly-scoped tuning pass — intensity/opacity/composition only, no
 * structural change, no touching `Hero.tsx`.
 *
 * Two changes, both presentation-only: the base opacity is modestly
 * higher (7% → 11%), and a vertical mask concentrates that intensity in
 * roughly the hero's own height, fading to fully transparent by ~110vh
 * down the page — "hero-specific blend/composition" achieved by masking
 * the existing fixed, full-viewport layer rather than moving or
 * duplicating it, so every other page (which also mounts this same
 * component via the marketing layout) keeps the identical restrained
 * top-of-page presence rather than gaining a new site-wide intensity
 * bump. Every lifecycle property proven on `/motion-lab`/Checkpoint 3
 * (reduced-motion, touch/coarse-pointer fallback, theme awareness,
 * visibility pause, resize, full cleanup) is unchanged — same component.
 *
 * Checkpoint 5.5 — the visual-direction reset judged the previous flat
 * 11%, full-width wash "too subtle to define the mood," explicitly
 * rejecting a further flat-opacity bump as the fix. Reworked instead as
 * an asymmetric composition: substantially higher opacity, masked into a
 * large field concentrated on the right ~60% of the viewport and bleeding
 * off the top/right edge (not a centered, fully-visible blob), fading to
 * near-transparent on the left ~25% where the hero's own headline sits so
 * body text stays legible. Still the one shared, lazily-mounted component
 * every marketing route pulls in — only its mask/opacity changed, not its
 * WebGL/lifecycle internals (reduced-motion, pointer fallback, visibility
 * pause, cleanup all unchanged, still proven on `/motion-lab`).
 *
 * Checkpoint 5, Sections 14/22 — the Diagnostic is a focused assessment,
 * not a landing page, and per Section 22 explicitly calls for reducing or
 * disabling this layer there if it isn't materially helping. It doesn't:
 * attention belongs on the question, not ambient motion. Skipping the
 * mount entirely (rather than just dropping opacity) also means the
 * dynamic-imported WebGL module and its canvas/context never load on the
 * one route where page weight matters most (Section 22's performance
 * note) — every other marketing route is untouched, since this is still
 * the one shared component already responsible for this decision.
 */
export function MarketingFluidField() {
  const pathname = usePathname();
  if (pathname?.startsWith("/diagnostic")) return null;

  // Checkpoint 5.5, third pass — the radial mask and the wrapper opacity
  // are both gone. They existed to fake a composition the old procedural
  // shader couldn't produce itself (one centred blob, cropped into
  // looking off-centre, dimmed so it didn't overwhelm). The real
  // simulation composes its own mass via seeded splats, and its display
  // pass already ramps density → colour → alpha, so masking and dimming
  // on top of it only desaturated the result: a deep green at 46% over
  // off-white reads as grey, which is exactly what the first capture of
  // the new sim showed. Intensity now lives in one place — the palette's
  // own `intensity`, in `FluidFieldRawGL.tsx`.
  //
  // The only remaining wrapper treatment is a soft vertical falloff, so
  // the field doesn't trail down the full scroll height of every
  // marketing page below the first viewport.
  const mask = "linear-gradient(to bottom, black 0, black 70vh, transparent 118vh)";

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
      aria-hidden
    >
      <FluidFieldRawGL />
    </div>
  );
}
