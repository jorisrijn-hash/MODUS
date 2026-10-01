"use client";

import { useEffect, useRef, type RefObject } from "react";
import { FluidSimGL, MODUS_FLUID_TUNING, type FluidPalette } from "@/lib/webgl/fluidSimGL";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { useResolvedTheme } from "@/lib/theme/useResolvedTheme";

/**
 * Checkpoint 5.5, third pass — now backed by a real incompressible-fluid
 * simulation (`fluidSimGL.ts`), replacing the procedural multi-blob
 * shader that `fluidFieldGL.ts` drove. That file and
 * `fluidPhysics.ts`'s `FLUID_FRAGMENT_BODY` are no longer used by
 * anything in production (only `FluidFieldPhysics`, the small
 * pointer-lag class, is still imported — by `imageBulgeGL.ts`, which is
 * a separate effect).
 *
 * COLOUR TRANSLATION — the explicit brief was: keep the reference's
 * contrast system, swap only the hue family (blue → MODUS green). So the
 * luminance relationship deliberately inverts between themes, exactly as
 * the reference's own light/dark heroes do:
 *
 *   light mode → off-white page, the mass reads DARK (near-black green
 *                core) with green pigment through its body and a pale
 *                green atmosphere at the edges
 *   dark mode  → near-black page, the mass reads LUMINOUS (MODUS green
 *                body) with a restrained pale mineral highlight only at
 *                the densest points
 *
 * In both cases the green lives *inside* a black/white contrast
 * framework rather than tinting the whole page — the failure mode the
 * brief called out ("dark green haze / green-tinted black page") is
 * specifically what the `glow` end of each ramp is kept close to the
 * page background to avoid.
 */
const PALETTES: Record<"light" | "dark", FluidPalette> = {
  light: {
    // Densest core: near-black with just enough green in it to not read
    // as neutral charcoal — this is the "dark organic form" the
    // reference puts in the upper right.
    core: [0.03, 0.09, 0.07],
    // Body: deep MODUS green (the brand accent doing the work).
    mid: [0.07, 0.26, 0.19],
    // Outer atmosphere: a pale green barely above the off-white page,
    // so the field fades into the background instead of ending abruptly.
    glow: [0.80, 0.87, 0.83],
    intensity: 0.92,
    // Dye is density, not display colour (the display pass maps density
    // onto the palette above). Injected well above 1.0 so splats saturate
    // the high end of the ramp and the mass actually reaches `core`.
    dye: [0.5, 1.25, 0.95],
  },
  dark: {
    // Densest core: restrained pale mineral highlight — reveals depth
    // inside the mass without becoming neon. First capture ran too
    // white/minty across too much of the mass, so this is pulled back
    // toward green and the display ramp now holds it to the very
    // densest points only (see `uCore` threshold in the display pass).
    core: [0.55, 0.82, 0.70],
    // Body: luminous MODUS green.
    mid: [0.20, 0.62, 0.45],
    // Outer atmosphere: deep green-black, close to the page.
    glow: [0.05, 0.13, 0.10],
    intensity: 0.85,
    dye: [0.5, 1.25, 0.95],
  },
};

function isCoarsePointer() {
  return typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
}

export function FluidFieldRawGL({
  className = "",
  fieldRef: externalFieldRef,
}: {
  className?: string;
  fieldRef?: RefObject<FluidSimGL | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const internalFieldRef = useRef<FluidSimGL | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const resolvedTheme = useResolvedTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reducedMotion || isCoarsePointer()) return;

    // Mobile/low-power: a materially cheaper grid rather than the full
    // desktop simulation (the composition survives; the resolution of
    // the velocity/dye fields is what gets cut).
    const narrow = window.innerWidth < 900;
    const tuning = narrow
      ? { ...MODUS_FLUID_TUNING, simResolution: 64, dyeResolution: 256, pressureIterations: 12 }
      : MODUS_FLUID_TUNING;

    const field = new FluidSimGL(canvas, tuning, PALETTES[resolvedTheme]);
    if (!field.supported) return;
    internalFieldRef.current = field;
    if (externalFieldRef) externalFieldRef.current = field;

    const dpr = Math.min(window.devicePixelRatio || 1, narrow ? 1.5 : 2);
    const resizeObserver = new ResizeObserver(([entry]) => {
      field.resize(entry.contentRect.width, entry.contentRect.height, dpr);
    });
    resizeObserver.observe(canvas);
    field.resize(canvas.clientWidth, canvas.clientHeight, dpr);

    function onPointerMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      field.setPointer((e.clientX - rect.left) / rect.width, (e.clientY - rect.top) / rect.height);
    }
    window.addEventListener("pointermove", onPointerMove);

    function onVisibility() {
      if (document.hidden) field.stop();
      else field.start();
    }
    document.addEventListener("visibilitychange", onVisibility);

    field.start();

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      resizeObserver.disconnect();
      field.dispose();
      internalFieldRef.current = null;
      if (externalFieldRef) externalFieldRef.current = null;
    };
  }, [reducedMotion, externalFieldRef, resolvedTheme]);

  useEffect(() => {
    internalFieldRef.current?.setPalette(PALETTES[resolvedTheme]);
  }, [resolvedTheme]);

  if (reducedMotion || isCoarsePointer()) return null;

  return (
    <canvas ref={canvasRef} className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden />
  );
}
