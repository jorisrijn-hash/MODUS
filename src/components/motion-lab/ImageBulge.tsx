"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ImageBulgeGL } from "@/lib/webgl/imageBulgeGL";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

function isCoarsePointer() {
  return typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
}

/**
 * Pointer-position lens/bulge on a single image — Checkpoint 2 spike
 * (Section 11). A plain `<Image>` underneath is what search
 * engines/screen readers/no-JS visitors see; the WebGL canvas is a
 * `pointer-events: none` overlay that renders the same image distorted,
 * shown only once the texture has loaded and only where WebGL2 + a fine
 * pointer are both available — the effect can never make the image
 * unavailable, only optionally enhance it.
 */
export function ImageBulge({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<ImageBulgeGL | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || reducedMotion || isCoarsePointer()) return;

    const bulge = new ImageBulgeGL(canvas);
    if (!bulge.supported) return;
    glRef.current = bulge;

    const resizeObserver = new ResizeObserver(([entry]) => {
      bulge.resize(entry.contentRect.width, entry.contentRect.height);
    });
    resizeObserver.observe(container);
    bulge.resize(container.clientWidth, container.clientHeight);

    let cancelled = false;
    bulge.loadImage(src).then(() => {
      if (!cancelled) canvas.style.opacity = "1"; // swap in only once the texture is ready — no flash of an untextured quad
    });

    function onPointerMove(e: PointerEvent) {
      const rect = container!.getBoundingClientRect();
      bulge.setPointer((e.clientX - rect.left) / rect.width, (e.clientY - rect.top) / rect.height);
    }
    function onEnter() {
      bulge.setActive(true);
    }
    function onLeave() {
      bulge.setActive(false);
    }
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerenter", onEnter);
    container.addEventListener("pointerleave", onLeave);

    function onVisibility() {
      if (document.hidden) bulge.stop();
      else bulge.start();
    }
    document.addEventListener("visibilitychange", onVisibility);

    bulge.start();

    return () => {
      cancelled = true;
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerenter", onEnter);
      container.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      resizeObserver.disconnect();
      bulge.dispose();
      glRef.current = null;
    };
  }, [src, reducedMotion]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <Image src={src} alt={alt} fill className="object-cover" unoptimized />
      {!reducedMotion && !isCoarsePointer() && (
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full opacity-0 transition-opacity duration-300"
          aria-hidden
        />
      )}
    </div>
  );
}
