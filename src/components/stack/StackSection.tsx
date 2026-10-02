"use client";

import { useEffect, useRef, useState } from "react";
import { BracketFrame } from "@/components/ui/BracketFrame";
import { Container } from "@/components/ui/Container";
import { StackFallback } from "@/components/stack/StackFallback";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { useDict, useLocale } from "@/lib/i18n/context";

/**
 * Section 02 — three tall story steps beside a sticky, real 3D
 * architecture scene.
 *
 * Pinning is CSS sticky only. ScrollTrigger does not pin, snap or hijack
 * scroll; it only maps this section's travel onto one reversible timeline.
 *
 * Desktop ≥1024px gets the WebGL scene. Below that, and for reduced motion
 * and WebGL failure, a complete flat diagram renders in normal reading
 * flow — those are fallbacks, not the primary effect.
 *
 * Card activation is deliberately independent of timeline progress: the
 * active card is whichever card centre is nearest the viewport centre,
 * recalculated from a passive, rAF-throttled scroll listener. The
 * reference keeps these separate, and tying activation to timeline
 * progress would make the cards switch at arbitrary fractions rather than
 * when a card is actually the one being read.
 */
export function StackSection() {
  const dict = useDict();
  const { locale } = useLocale();
  const t = dict.home.stack;
  const reducedMotion = usePrefersReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const sceneHostRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const fallbackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // --- Nearest-centre card activation ------------------------------------
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const mid = window.innerHeight / 2;
      let bestIndex = 0;
      let bestDistance = Infinity;
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - mid);
        if (d < bestDistance) {
          bestDistance = d;
          bestIndex = i;
        }
      });
      setActive((cur) => (cur === bestIndex ? cur : bestIndex));
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // --- 3D scene -----------------------------------------------------------
  useEffect(() => {
    const host = sceneHostRef.current;
    const section = sectionRef.current;
    if (!host || !section) return;

    // Reduced motion and sub-1024px both get the complete flat diagram in
    // normal reading flow instead of the scene. Revealing it here (rather
    // than leaving it `lg:hidden`) is what stops a reduced-motion desktop
    // visitor seeing an empty 100vh column where the diagram should be.
    if (reducedMotion || !window.matchMedia("(min-width: 1024px)").matches) {
      if (reducedMotion) {
        fallbackRef.current?.classList.remove("lg:hidden");
        host.parentElement?.classList.add("lg:hidden");
      }
      return;
    }

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    // Lazy, client-only, and only after fonts resolve — the panel textures
    // bake type into a canvas, so building them before `fonts.ready`
    // permanently stamps a fallback face into the diagram.
    const build = async () => {
      const [{ createStackScene }, { createStackTimeline, ScrollTrigger }] = await Promise.all([
        import("@/lib/three/stackScene"),
        import("@/lib/three/stackTimeline"),
      ]);
      try {
        await document.fonts.ready;
      } catch {
        /* a font-loading failure must not block the diagram */
      }
      if (cancelled) return;

      const canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      canvas.className = "h-full w-full";
      host.appendChild(canvas);

      const css = getComputedStyle(document.documentElement);
      const rgb = (name: string) => {
        const v = css.getPropertyValue(name).trim();
        return v ? `rgb(${v.replace(/\s+/g, ",")})` : "#D7D7D0";
      };
      const scene = createStackScene(
        canvas,
        { heading: t.diagram.heading, support: t.diagram.support },
        {
          ground: rgb("--canvas"),
          ink: rgb("--text-primary"),
          muted: rgb("--text-muted"),
          green: rgb("--accent"),
          cream: rgb("--surface"),
        }
      );
      if (!scene || cancelled) {
        canvas.remove();
        // WebGL unavailable on a desktop viewport: reveal the flat diagram
        // that is otherwise hidden at this breakpoint, so the column is
        // never simply empty.
        fallbackRef.current?.classList.remove("lg:hidden");
        return;
      }

      const fit = () => {
        const r = host.getBoundingClientRect();
        scene.resize(r.width, r.height, window.devicePixelRatio || 1);
      };
      fit();

      const tl = createStackTimeline(section, scene.state, scene.apply);

      // 150ms debounce, then refresh the trigger and re-render — a resize
      // changes both the camera fit and the section's scroll boundaries.
      let resizeTimer: ReturnType<typeof setTimeout>;
      const onResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          fit();
          ScrollTrigger.refresh();
        }, 150);
      };
      window.addEventListener("resize", onResize);
      // Late layout shifts (images, late fonts) move the boundaries too.
      ScrollTrigger.refresh();

      cleanup = () => {
        clearTimeout(resizeTimer);
        window.removeEventListener("resize", onResize);
        // Only this component's own timeline and trigger. Never a global
        // kill — that would take out every other ScrollTrigger on the page.
        tl.scrollTrigger?.kill();
        tl.kill();
        scene.dispose();
        canvas.remove();
      };
    };

    // Genuinely lazy: the module, the WebGL context, the canvas and the
    // nine baked textures are all created only once the section is within
    // roughly two viewports of being read. A visitor who never scrolls
    // that far never pays for any of it, and the top of the homepage
    // carries exactly one canvas (the hero) rather than two.
    //
    // There is no frame loop to pause here: the scene renders only from
    // the scrubbed timeline's `onUpdate`, so it draws while the section is
    // being scrolled through and is genuinely idle otherwise.
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        void build();
      },
      // ~60% of a viewport of lead time: enough to finish the dynamic
      // import and bake the textures before the section is reached, but
      // not so much that the observer is already intersecting at the top
      // of the homepage. 200% was, which defeated the whole point.
      { rootMargin: "60% 0px" }
    );
    io.observe(section);

    return () => {
      cancelled = true;
      io.disconnect();
      cleanup?.();
    };
    // `t.diagram` is dictionary content: a locale change must rebuild the
    // baked textures, or the diagram keeps the previous language.
  }, [reducedMotion, t.diagram]);

  return (
    <section ref={sectionRef} className="relative">
      <Container>
        <div className="pt-24 md:pt-32">
          <p className="font-mono text-label uppercase text-muted">{t.label}</p>
          <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            {/* Keyed by locale — see the note on Hero's <h1>: SplitText
                  reparents these spans, so React must replace the whole
                  heading on a language change rather than patch inside it. */}
              <h2 key={locale} data-split="heading" className="font-serif text-display-section text-ink">
              {t.headingLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
            <p className="max-w-[calc(420*var(--sf))] text-[14px] leading-relaxed text-graphite">
              {t.intro}
            </p>
          </div>
        </div>

        {/*
         * Story column ~32% (clamped to 300-350px), scene column the
         * remaining ~68%. Previously the story column was a fixed 460px
         * and the scene took whatever was left, which made the cards the
         * dominant element and the diagram an afterthought.
         */}
        <div className="mt-16 lg:mt-24 lg:flex lg:gap-scene-gap">
          {/* Story column: three real 100vh wrappers on desktop, so the
              scroll travel the timeline maps onto is genuine layout rather
              than an invented scroll length. */}
          <div className="lg:w-[clamp(300px,32%,350px)] lg:shrink-0">
            {t.steps.map((step, i) => (
              <div
                key={step.id}
                className="pb-8 lg:h-screen lg:pb-12"
                // Trigger source for this card's heading reveal. The
                // heading itself sits inside a sticky card, so once the
                // card sticks its viewport position stops tracking scroll
                // and it is useless as a ScrollTrigger. This wrapper is
                // the heading's own story step and scrolls normally, so
                // `clamp(top 80%)` against it still fires exactly as the
                // card enters from the bottom.
                //
                // Attribute only — no layout, sticky offset or height
                // change, and the nearest-centre activation below is
                // untouched.
                data-split-trigger=""
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
              >
                <div className="lg:sticky lg:top-32">
                  <BracketFrame
                    tone={active === i ? "active" : "inactive"}
                    // Tighter than the default frame padding: these cards sit
                    // beside the scene and should not dominate it. Body text
                    // size is held readable; only padding and gaps shrink.
                    className="p-5 md:p-6"
                  >
                    <p
                      className={`font-mono text-label uppercase ${
                        active === i ? "text-[rgb(var(--surface-inverted-foreground))]/70" : "text-muted"
                      }`}
                    >
                      {step.eyebrow}
                    </p>
                    {/* The three stack story headings — the primary target
                        of the masked reveal. Default mode (lines). */}
                    <h3 key={locale} data-split="heading" className="mt-4 font-serif text-[21px] leading-[1.2] md:text-[24px]">
                      {step.heading}
                    </h3>
                    <p
                      className={`mt-4 text-[13.5px] leading-relaxed ${
                        active === i
                          ? "text-[rgb(var(--surface-inverted-foreground))]/75"
                          : "text-graphite"
                      }`}
                    >
                      {step.body}
                    </p>
                  </BracketFrame>
                </div>
              </div>
            ))}
          </div>

          {/* Scene column. CSS sticky provides the pin. `pointer-events-none`
              so the decorative canvas never intercepts scroll or clicks. */}
          <div className="hidden flex-1 lg:block">
            <div
              ref={sceneHostRef}
              className="pointer-events-none sticky top-0 h-screen"
              aria-hidden="true"
            />
          </div>
        </div>

        {/*
         * Complete flat diagram: the specified fallback below 1024px, and
         * revealed at desktop only if the 3D scene fails to start.
         *
         * `lg:hidden` is applied from the very first render and is only
         * ever *removed* on failure. It is deliberately not driven by
         * React state, and that is a correctness fix rather than a
         * preference: toggling it on after the scene mounted shortened
         * this section by the full height of the flat diagram *after*
         * `ScrollTrigger.refresh()` had already measured it. The trigger
         * kept the taller geometry, so scrolling to the real bottom of the
         * section only reached ~0.8 progress and the 2.0 → 2.7 flatten
         * segment never ran — the diagram stayed tilted at the end. Found
         * by measuring scroll position against section bounds, not by
         * reading the code.
         */}
        <div ref={fallbackRef} className="lg:hidden">
          <StackFallback />
        </div>

        {/* Accessible equivalent of the canvas, present in every path. */}
        <p className="sr-only">{t.diagram.description}</p>
      </Container>
    </section>
  );
}
