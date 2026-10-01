"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
  useAnimationFrame,
  useMotionValueEvent,
} from "motion/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useDict } from "@/lib/i18n/context";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

// ---------------------------------------------------------------------------
// Geometry — pure numbers, square viewBox (so the DOM overlay's percentage
// positions can never drift from what the SVG drew). Center at (350, 350).
// ---------------------------------------------------------------------------

const VIEW = 700;
const CENTER = { x: 350, y: 350 };
const CORE_R = 66;

// Rounded to 3 decimal places — `Math.cos`/`Math.sin` can return a value
// that differs in the last bit between Node's V8 (server render) and the
// browser's V8 (client render) for the same input, which is a real
// hydration mismatch on any SVG coordinate computed this way, not a false
// positive. Three decimals is already far finer than this SVG renders at.
function round(v: number) {
  return Math.round(v * 1000) / 1000;
}
function polar(angleDeg: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: round(CENTER.x + Math.cos(rad) * r), y: round(CENTER.y + Math.sin(rad) * r) };
}

// Five concentric rings — deliberately not identical: mixed dash rhythm,
// mixed rotation speed/direction, some static. Grouped into three parallax
// depth bands: outer (rings 3&4), mid (rings 1&2), core (ring 0 + the core
// disc, opposite direction, per "central core: ±2px opposite direction").
const RINGS = [
  { r: 118, dash: "1 7", duration: 0, depth: "core" as const },
  { r: 168, dash: "3 5", duration: 150, depth: "mid" as const },
  { r: 218, dash: "1 4", duration: -205, depth: "mid" as const },
  { r: 262, dash: "2 9", duration: 135, depth: "outer" as const },
  { r: 305, dash: "1 6", duration: -180, depth: "outer" as const },
];

// A few calibration ticks on the outermost ring — short radial rules, the
// "measurement instrument, not astronomy" detail — at fixed angles
// unrelated to any domain, so they read as instrument markings rather than
// business meaning.
const CALIBRATION_ANGLES = [0, 72, 144, 216, 288];

type Domain = { angle: number; ring: number };

// Editorial (not evenly-spaced) placement, matched to the approved
// reference rather than a mechanical 72°-apart layout.
const DOMAINS: Domain[] = [
  { angle: 255, ring: 305 }, // Customer — top, slightly left
  { angle: 200, ring: 218 }, // Operations — upper-left
  { angle: 168, ring: 305 }, // Systems — far left
  { angle: 96, ring: 305 }, // Data — bottom
  { angle: 34, ring: 262 }, // Measurement — lower-right
];

// Customer (index 0) carries the one active signal in this demo state.
const ACTIVE_DOMAIN = 0;

// Small neutral secondary nodes — unlabeled, some with a tiny inner
// marker — scattered to read as "more going on" than five categories,
// each given its own very slow independent orbital drift.
const SECONDARY_NODES = [
  { angle: 280, ring: 168, size: 3, marked: true, driftDir: 1, driftDur: 190 },
  { angle: 315, ring: 218, size: 2.4, marked: false, driftDir: -1, driftDur: 220 },
  { angle: 15, ring: 168, size: 2.6, marked: false, driftDir: 1, driftDur: 205 },
  { angle: 60, ring: 118, size: 2.2, marked: true, driftDir: -1, driftDur: 175 },
  { angle: 130, ring: 262, size: 3.2, marked: false, driftDir: 1, driftDur: 230 },
  { angle: 150, ring: 118, size: 2.4, marked: false, driftDir: -1, driftDur: 165 },
  { angle: 225, ring: 262, size: 2.8, marked: true, driftDir: 1, driftDur: 210 },
  { angle: 340, ring: 305, size: 2.4, marked: false, driftDir: -1, driftDur: 240 },
  { angle: 75, ring: 218, size: 3, marked: false, driftDir: 1, driftDur: 195 },
  { angle: 185, ring: 168, size: 2.2, marked: true, driftDir: -1, driftDur: 180 },
];

function smoothPath(points: { x: number; y: number }[]): string {
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const midX = (p0.x + p1.x) / 2;
    const midY = (p0.y + p1.y) / 2;
    d += ` C ${p0.x},${midY} ${midX},${p1.y} ${p1.x},${p1.y}`;
  }
  return d;
}

// A path from a domain node to just inside the core's edge — stops short
// of dead-center so it visually "arrives," rather than every path
// converging on one exact overlapping point.
function domainPath(d: Domain) {
  const from = polar(d.angle, d.ring);
  const to = polar(d.angle, CORE_R - 10);
  const mid = polar(d.angle, (d.ring + CORE_R) / 2 + 20);
  return smoothPath([from, mid, to]);
}

// Faint domain-to-domain relationships (a closed loop, Customer through
// Measurement and back) — reinforces "businesses are systems" without
// every path having to run through the core. A gentle arc at a shared mid
// radius, not a straight chord, so it reads as a route, not a wire.
function relationshipPath(a: Domain, b: Domain) {
  const from = polar(a.angle, Math.min(a.ring, 250));
  const to = polar(b.angle, Math.min(b.ring, 250));
  const midAngle = (a.angle + b.angle) / 2;
  const bow = polar(midAngle, 230);
  return smoothPath([from, bow, to]);
}
const RELATIONSHIPS = DOMAINS.map((d, i) => [d, DOMAINS[(i + 1) % DOMAINS.length]] as const);

const pct = (v: number) => `${(v / VIEW) * 100}%`;

function subscribeNever() {
  return () => {};
}
function getPointerFine() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: fine)").matches;
}

// ---------------------------------------------------------------------------

export function HeroOrbitalSystem({
  onExaminingChange,
}: {
  /** Lets the hero copy's own "CURRENTLY EXAMINING" line reflect whatever
   * this visual is currently focused on — called with `null` to fall back
   * to that line's own default rotation. */
  onExaminingChange?: (text: string | null) => void;
}) {
  const dict = useDict();
  const t = dict.home.heroOrbital;
  const prefersReducedMotion = usePrefersReducedMotion();
  const pointerFine = useSyncExternalStore(subscribeNever, getPointerFine, () => false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const [hoveredDomain, setHoveredDomain] = useState<number | null>(null);
  const [lockedDomain, setLockedDomain] = useState<number | null>(null);
  const [coreHovered, setCoreHovered] = useState(false);
  const [signalHovered, setSignalHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [scrollDetected, setScrollDetected] = useState(false);

  // Hover previews; a click locks the focus so it survives the pointer
  // moving on (brief's "hover = preview, click = inspect"). Escape and
  // clicking the core both return to the overview.
  const focusedDomain = lockedDomain ?? hoveredDomain;
  const signalActive = pinned || signalHovered || scrollDetected;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setLockedDomain(null);
        setPinned(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Sync the hero copy's "CURRENTLY EXAMINING" line to whatever this
  // visual is focused on right now — a genuine external system from this
  // component's point of view (the parent's own state), not local state
  // being derived from itself.
  const examiningText = focusedDomain !== null ? t.examining[focusedDomain] : signalActive ? t.examiningSignal : null;
  useEffect(() => {
    onExaminingChange?.(examiningText);
  }, [examiningText, onExaminingChange]);
  useEffect(() => {
    return () => onExaminingChange?.(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Pointer parallax: three depth bands, core moving opposite the
  // outer rings. Style is *always* the same shape (never toggled to
  // `undefined`) — a motion.g that mounts without a style-driven value and
  // gets one later never picks it back up (confirmed the hard way on the
  // first version of this hero). Gating instead happens inside
  // handlePointerMove, which never sets px/py away from 0 when parallax
  // shouldn't apply. ---
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const springX = useSpring(px, { stiffness: 55, damping: 16, mass: 0.6 });
  const springY = useSpring(py, { stiffness: 55, damping: 16, mass: 0.6 });
  const outerX = useTransform(springX, [-1, 1], [-4, 4]);
  const outerY = useTransform(springY, [-1, 1], [-4, 4]);
  const midX = useTransform(springX, [-1, 1], [-6, 6]);
  const midY = useTransform(springY, [-1, 1], [-6, 6]);
  const coreX = useTransform(springX, [-1, 1], [2, -2]);
  const coreY = useTransform(springY, [-1, 1], [2, -2]);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!pointerFine || prefersReducedMotion) return;
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    px.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
    py.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
  }
  function handlePointerLeave() {
    px.set(0);
    py.set(0);
  }

  // --- Scroll narrative: OBSERVE -> CONNECT -> DETECT -> FOCUS across the
  // first ~35% of hero scroll progress. Rather than a separate text-based
  // state machine, DETECT/FOCUS reuse the exact same `active` visual
  // state Signal hover already drives (the active path brightens, the
  // core responds, the inspector shows the Signal) — one real mechanism,
  // not two parallel ones that could disagree. ---
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end start"] });
  const outerScale = useTransform(scrollYProgress, [0, 1], [1, prefersReducedMotion ? 1 : 0.97]);
  const midScale = useTransform(scrollYProgress, [0, 1], [1, prefersReducedMotion ? 1 : 0.985]);
  const coreScale = useTransform(scrollYProgress, [0, 1], [1, prefersReducedMotion ? 1 : 1.02]);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (prefersReducedMotion) return;
    setScrollDetected(v > 0.28);
  });

  // --- One traveling particle along the active domain's path. ---
  const activePathRef = useRef<SVGPathElement>(null);
  const particleRef = useRef<SVGCircleElement>(null);
  useAnimationFrame((time) => {
    if (prefersReducedMotion) return;
    const path = activePathRef.current;
    const particle = particleRef.current;
    if (!path || !particle) return;
    const duration = 9000;
    const cooldown = 0.55; // travels, then waits before repeating
    const cycle = (time % duration) / duration;
    if (cycle > cooldown) {
      particle.setAttribute("opacity", "0");
      return;
    }
    const tNorm = cycle / cooldown;
    const len = path.getTotalLength();
    const point = path.getPointAtLength(len * tNorm);
    particle.setAttribute("cx", String(point.x));
    particle.setAttribute("cy", String(point.y));
    particle.setAttribute("opacity", tNorm < 0.05 || tNorm > 0.95 ? "0" : "0.95");
  });

  // Where the Signal's own hit target sits — the core's right edge, so its
  // leader line has real continuity into the annotation regardless of
  // which domain is active.
  const CORE_EDGE = { x: CENTER.x + CORE_R + 6, y: CENTER.y };

  function toggleLock(i: number) {
    setLockedDomain((cur) => (cur === i ? null : i));
  }

  return (
    <div className="flex flex-col items-center gap-6 px-10 sm:flex-row sm:px-0">
      <div
        ref={wrapRef}
        data-testid="hero-orbital"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="relative aspect-square w-full max-w-[560px] select-none"
      >
        {/* Decorative layer: rings, nodes, paths, core. Parallax/scroll
            transforms live here only — never on the interactive overlay
            below, so hovering a real control can't move the control
            itself (the feedback loop found and fixed on the first
            version of this hero). */}
        <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <radialGradient id="hos-core" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#1B5A43" />
              <stop offset="100%" stopColor="#0D2B20" />
            </radialGradient>
          </defs>

          {/* Outer depth band */}
          <motion.g data-testid="hos-outer" style={{ x: outerX, y: outerY, scale: outerScale, transformOrigin: `${CENTER.x}px ${CENTER.y}px` }}>
            {RINGS.filter((r) => r.depth === "outer").map((ring, i) => (
              <motion.circle
                key={`ring-outer-${i}`}
                cx={CENTER.x}
                cy={CENTER.y}
                r={ring.r}
                fill="none"
                stroke="#C7CBC3"
                strokeWidth={1}
                strokeDasharray={ring.dash}
                style={{ transformOrigin: `${CENTER.x}px ${CENTER.y}px` }}
                initial={{ opacity: 0, rotate: 0 }}
                animate={{ opacity: 1, rotate: prefersReducedMotion ? 0 : [0, ring.duration >= 0 ? 360 : -360] }}
                transition={{
                  opacity: { duration: 0.5, delay: 0.18 + i * 0.08 },
                  rotate: prefersReducedMotion ? { duration: 0 } : { duration: Math.abs(ring.duration), repeat: Infinity, ease: "linear" },
                }}
              />
            ))}
            {/* Calibration ticks on the outermost ring — instrument, not orbit */}
            {CALIBRATION_ANGLES.map((a, i) => {
              const inner = polar(a, 297);
              const outer = polar(a, 313);
              return <line key={`tick-${i}`} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#9BA39B" strokeWidth={1} />;
            })}
            {SECONDARY_NODES.filter((n) => n.ring >= 260).map((n, i) => (
              <SecondaryNode key={`sec-outer-${i}`} node={n} reducedMotion={prefersReducedMotion} delay={0.5 + i * 0.05} />
            ))}
          </motion.g>

          {/* Mid depth band */}
          <motion.g data-testid="hos-mid" style={{ x: midX, y: midY, scale: midScale, transformOrigin: `${CENTER.x}px ${CENTER.y}px` }}>
            {RINGS.filter((r) => r.depth === "mid").map((ring, i) => (
              <motion.circle
                key={`ring-mid-${i}`}
                cx={CENTER.x}
                cy={CENTER.y}
                r={ring.r}
                fill="none"
                stroke="#D7DAD3"
                strokeWidth={1}
                strokeDasharray={ring.dash}
                style={{ transformOrigin: `${CENTER.x}px ${CENTER.y}px` }}
                initial={{ opacity: 0, rotate: 0 }}
                animate={{ opacity: 1, rotate: prefersReducedMotion ? 0 : [0, ring.duration >= 0 ? 360 : -360] }}
                transition={{
                  opacity: { duration: 0.5, delay: 0.1 + i * 0.08 },
                  rotate: prefersReducedMotion ? { duration: 0 } : { duration: Math.abs(ring.duration), repeat: Infinity, ease: "linear" },
                }}
              />
            ))}
            {SECONDARY_NODES.filter((n) => n.ring < 260 && n.ring > 130).map((n, i) => (
              <SecondaryNode key={`sec-mid-${i}`} node={n} reducedMotion={prefersReducedMotion} delay={0.4 + i * 0.05} />
            ))}

            {/* Domain-to-domain relationships — a closed loop reinforcing
                "businesses are systems," independent of the core. */}
            {RELATIONSHIPS.map(([a, b], i) => {
              const aIdx = DOMAINS.indexOf(a);
              const bIdx = DOMAINS.indexOf(b);
              const relevant = focusedDomain === aIdx || focusedDomain === bIdx;
              // Deliberately *not* mixing a scroll-linked motion value into
              // this element's opacity depending on `relevant` — a style
              // prop whose value TYPE changes between renders (a raw
              // number vs a MotionValue) risks the exact same "motion
              // value silently stops updating" class of bug already found
              // once on this component. `animate` alone, always present,
              // covers this fine — the scroll narrative is already carried
              // by outerScale/midScale/coreScale/scrollDetected elsewhere.
              return (
                <motion.path
                  key={`rel-${i}`}
                  d={relationshipPath(a, b)}
                  fill="none"
                  stroke="#B9BDB6"
                  strokeWidth={relevant ? 1.25 : 1}
                  strokeDasharray="1 5"
                  initial={{ pathLength: 0, opacity: 0.18 }}
                  animate={{ pathLength: 1, opacity: relevant ? 0.75 : 0.18 }}
                  transition={{ pathLength: { duration: 0.7, delay: 0.6 + i * 0.05 }, opacity: { duration: 0.3 } }}
                />
              );
            })}

            {/* Domain paths + primary nodes */}
            {DOMAINS.map((d, i) => {
              const isActiveSignalDomain = i === ACTIVE_DOMAIN;
              const dimmed = focusedDomain !== null && focusedDomain !== i;
              const focused = focusedDomain === i;
              const emphasized = (isActiveSignalDomain && signalActive) || focused;
              const node = polar(d.angle, d.ring);
              return (
                <g key={`domain-${i}`} data-testid={`domain-path-${i}`}>
                  <motion.path
                    ref={isActiveSignalDomain ? activePathRef : undefined}
                    d={domainPath(d)}
                    fill="none"
                    stroke={emphasized ? "#1B5A43" : "#B9BDB6"}
                    strokeWidth={emphasized ? 1.5 : 1}
                    strokeDasharray={isActiveSignalDomain ? undefined : "1 4"}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: dimmed ? 0.25 : emphasized ? 0.95 : 0.55 }}
                    transition={{
                      pathLength: { duration: 0.6, delay: 0.5 + i * 0.06, ease: [0.16, 1, 0.3, 1] },
                      opacity: { duration: 0.3 },
                    }}
                  />
                  <motion.circle
                    cx={node.x}
                    cy={node.y}
                    r={isActiveSignalDomain ? 5 : 4}
                    fill={isActiveSignalDomain && signalActive ? "#123C2D" : "#FAFAF8"}
                    stroke={focused ? "#1B5A43" : isActiveSignalDomain && signalActive ? "#1B5A43" : "#9BA39B"}
                    strokeWidth={focused ? 1.75 : 1.25}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: dimmed ? 0.4 : 1, scale: focused ? 1.3 : 1 }}
                    transition={{
                      opacity: { duration: 0.3, delay: 0.55 + i * 0.06 },
                      scale: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
                    }}
                  />
                </g>
              );
            })}

            {/* Active signal marker, at the core's edge */}
            <motion.circle
              cx={CORE_EDGE.x}
              cy={CORE_EDGE.y}
              r={signalActive ? 4.5 : 3.5}
              fill="#FAFAF8"
              stroke="#123C2D"
              strokeWidth={1.25}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 1 }}
            />
            {!prefersReducedMotion && (
              <motion.circle
                cx={CORE_EDGE.x}
                cy={CORE_EDGE.y}
                fill="none"
                stroke="#1B5A43"
                strokeWidth={1}
                initial={{ r: 5, opacity: signalActive ? 0.6 : 0.35 }}
                animate={{
                  r: signalActive ? [5, 13, 5] : [5, 9, 5],
                  opacity: signalActive ? [0.6, 0, 0.6] : [0.35, 0, 0.35],
                }}
                transition={{ duration: signalActive ? 2 : 3.6, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            <circle ref={particleRef} r={2.4} fill="#1B5A43" opacity={0} />
          </motion.g>

          {/* Core depth band — moves opposite the outer rings */}
          <motion.g data-testid="hos-core" style={{ x: coreX, y: coreY, scale: coreScale, transformOrigin: `${CENTER.x}px ${CENTER.y}px` }}>
            {RINGS.filter((r) => r.depth === "core").map((ring, i) => (
              <motion.circle
                key={`ring-core-${i}`}
                cx={CENTER.x}
                cy={CENTER.y}
                r={ring.r}
                fill="none"
                stroke="#CDD1C8"
                strokeWidth={1}
                strokeDasharray={ring.dash}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.05 }}
              />
            ))}
            {SECONDARY_NODES.filter((n) => n.ring <= 130).map((n, i) => (
              <SecondaryNode key={`sec-core-${i}`} node={n} reducedMotion={prefersReducedMotion} delay={0.35 + i * 0.05} />
            ))}

            <motion.circle
              cx={CENTER.x}
              cy={CENTER.y}
              r={CORE_R}
              fill="url(#hos-core)"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: coreHovered ? 1.04 : 1 }}
              transition={{ opacity: { duration: 0.4 }, scale: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }}
            />
            {!prefersReducedMotion && (
              <motion.circle
                cx={CENTER.x}
                cy={CENTER.y}
                r={CORE_R}
                fill="none"
                stroke="#3E8064"
                strokeWidth={1}
                initial={{ opacity: 0.5, scale: 1 }}
                animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.16, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformOrigin: `${CENTER.x}px ${CENTER.y}px` }}
              />
            )}
            {/* Thin internal precision ring, visible only while inspecting
                (core hover or an active domain lock) — "DETECTING" state */}
            <motion.circle
              cx={CENTER.x}
              cy={CENTER.y}
              r={CORE_R - 16}
              fill="none"
              stroke="#FAFAF8"
              strokeWidth={1}
              strokeDasharray="1 3"
              initial={{ opacity: 0 }}
              animate={{ opacity: coreHovered || focusedDomain !== null ? 0.55 : 0 }}
              transition={{ duration: 0.3 }}
            />
            <line
              x1={CENTER.x - (coreHovered ? 10 : 12)}
              y1={CENTER.y}
              x2={CENTER.x + (coreHovered ? 10 : 12)}
              y2={CENTER.y}
              stroke="#FAFAF8"
              strokeWidth={1.25}
            />
            <line
              x1={CENTER.x}
              y1={CENTER.y - (coreHovered ? 10 : 12)}
              x2={CENTER.x}
              y2={CENTER.y + (coreHovered ? 10 : 12)}
              stroke="#FAFAF8"
              strokeWidth={1.25}
            />
            <circle cx={CENTER.x} cy={CENTER.y} r={2.2} fill="#FAFAF8" />
          </motion.g>
        </svg>

        {/* Interactive overlay — real DOM, stationary, never inside a
            transformed ancestor a hover could itself perturb. */}
        <div className="absolute inset-0">
          <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
            {DOMAINS.map((d, i) => {
              const node = polar(d.angle, d.ring);
              const label = polar(d.angle, d.ring + 34);
              return <line key={`leader-${i}`} x1={node.x} y1={node.y} x2={label.x} y2={label.y} stroke="#B9BDB6" strokeWidth={1} />;
            })}
          </svg>

          {DOMAINS.map((d, i) => {
            const label = polar(d.angle, d.ring + 34);
            const alignRight = label.x < CENTER.x;
            const isLocked = lockedDomain === i;
            return (
              <button
                key={`domain-label-${i}`}
                type="button"
                onMouseEnter={() => setHoveredDomain(i)}
                onMouseLeave={() => setHoveredDomain(null)}
                onFocus={() => setHoveredDomain(i)}
                onBlur={() => setHoveredDomain(null)}
                onClick={() => toggleLock(i)}
                aria-pressed={isLocked}
                aria-label={`${t.domains[i]} — ${t.states[i]}${isLocked ? " (locked)" : ""}`}
                className={`absolute flex -translate-y-1/2 flex-col whitespace-nowrap rounded-sm px-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted transition-colors duration-200 hover:text-ink focus-visible:text-ink focus-visible:outline-none ${alignRight ? "-translate-x-full items-end text-right" : "items-start"} ${isLocked ? "text-ink" : ""}`}
                style={{ left: pct(label.x), top: pct(label.y) }}
              >
                <span className="flex items-center gap-1.5">
                  {isLocked && <span className="h-1 w-1 rounded-full bg-modus" aria-hidden />}
                  {t.domains[i]}
                </span>
                <span className="text-[8.5px] tracking-[0.08em] text-muted/70">{t.states[i]}</span>
              </button>
            );
          })}

          {/* Core hit target */}
          <button
            type="button"
            aria-label={t.coreLabel}
            onMouseEnter={() => setCoreHovered(true)}
            onMouseLeave={() => setCoreHovered(false)}
            onFocus={() => setCoreHovered(true)}
            onBlur={() => setCoreHovered(false)}
            onClick={() => {
              setLockedDomain(null);
              setPinned(false);
            }}
            className="absolute h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
            style={{ left: pct(CENTER.x), top: pct(CENTER.y) }}
          />

          {/* Signal hit target */}
          <button
            type="button"
            aria-label={`${t.frictionDetected} — ${t.viewInsight}`}
            aria-pressed={pinned}
            onMouseEnter={() => setSignalHovered(true)}
            onMouseLeave={() => setSignalHovered(false)}
            onFocus={() => setSignalHovered(true)}
            onBlur={() => setSignalHovered(false)}
            onClick={() => setPinned((v) => !v)}
            className="absolute h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
            style={{ left: pct(CORE_EDGE.x), top: pct(CORE_EDGE.y) }}
          />
        </div>
      </div>

      {/* Leader line running straight out from the core's own edge on
          desktop (`self-center` = the circle's vertical center, since the
          circle is the tallest row item). Below `sm`, the layout is a
          column instead of a row, so this reorients to a short vertical
          rule above the stacked inspector — kept reachable, not hidden. */}
      <div className="h-6 w-px shrink-0 self-center bg-line sm:h-px sm:w-10 lg:w-16" />

      <Inspector
        domainIndex={focusedDomain}
        signalActive={signalActive}
        t={t}
      />
    </div>
  );
}

function Inspector({
  domainIndex,
  signalActive,
  t,
}: {
  domainIndex: number | null;
  signalActive: boolean;
  t: ReturnType<typeof useDict>["home"]["heroOrbital"];
}) {
  // Priority: an explicitly focused domain > the active Signal > the quiet
  // default overview — matches "hover = preview, click = inspect," with
  // the ambient Signal state filling the gap when nothing is focused.
  const mode = domainIndex !== null ? "domain" : signalActive ? "signal" : "default";

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
      className="w-44 shrink-0 text-center sm:text-left"
    >
      <div key={mode} data-testid="hero-inspector">
        {mode === "domain" && domainIndex !== null && (
          <>
            <p className="font-mono text-[9.5px] font-medium uppercase tracking-[0.08em] text-ink">{t.domains[domainIndex]}</p>
            <p className="mt-2 font-mono text-[8.5px] uppercase tracking-[0.08em] text-muted">{t.whatModusObserves}</p>
            <ul className="mt-1 space-y-0.5 text-[11.5px] leading-snug text-graphite">
              {t.observes[domainIndex].slice(0, 4).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-2 font-mono text-[8.5px] uppercase tracking-[0.08em] text-muted">{t.channelsLabel}</p>
            <p className="mt-1 text-[11px] leading-snug text-muted">{t.secondary[domainIndex].join(" · ")}</p>
          </>
        )}

        {mode === "signal" && (
          <>
            <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted">{t.signalId}</p>
            <p className="text-[13px] font-medium text-ink">{t.signalTitle}</p>
            <div className="my-2 h-px w-full bg-line" />
            <p className="font-mono text-[9.5px] font-medium uppercase tracking-[0.08em] text-signal">{t.frictionDetected}</p>
            <p className="mt-1.5 text-[11.5px] leading-snug text-graphite">{t.signalObservation}</p>
            <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
              <p className="font-mono text-[8px] uppercase tracking-[0.06em] text-muted">
                {t.impactLabel}
                <span className="ml-1 text-ink">{t.impactHigh}</span>
              </p>
              <p className="font-mono text-[8px] uppercase tracking-[0.06em] text-muted">
                {t.effortLabel}
                <span className="ml-1 text-ink">{t.effortMedium}</span>
              </p>
            </div>
            <Link
              href="/#business-x-ray"
              className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-medium text-ink underline decoration-line underline-offset-4 hover:text-modus"
            >
              {t.viewInsight}
              <ArrowRight className="h-3 w-3" strokeWidth={1.75} />
            </Link>
          </>
        )}

        {mode === "default" && (
          <>
            <p className="font-mono text-[9.5px] font-medium uppercase tracking-[0.08em] text-ink">{t.overviewTitle}</p>
            <p className="mt-1 text-[12px] font-medium text-graphite">{t.overviewHeading}</p>
            <p className="mt-1.5 text-[11.5px] leading-snug text-muted">{t.overviewBody}</p>
            <p className="mt-2 font-mono text-[8.5px] uppercase tracking-[0.06em] text-muted/70">{t.overviewHint}</p>
          </>
        )}
      </div>
    </motion.div>
  );
}

function SecondaryNode({
  node,
  reducedMotion,
  delay,
}: {
  node: (typeof SECONDARY_NODES)[number];
  reducedMotion: boolean;
  delay: number;
}) {
  const p = polar(node.angle, node.ring);
  return (
    <motion.g
      style={{ transformOrigin: `${CENTER.x}px ${CENTER.y}px` }}
      initial={{ opacity: 0, rotate: 0 }}
      animate={{ opacity: 0.7, rotate: reducedMotion ? 0 : [0, node.driftDir * 360] }}
      transition={{
        opacity: { duration: 0.4, delay },
        rotate: reducedMotion ? { duration: 0 } : { duration: node.driftDur, repeat: Infinity, ease: "linear" },
      }}
    >
      <circle cx={p.x} cy={p.y} r={node.size} fill="#FAFAF8" stroke="#B9BDB6" strokeWidth={1} />
      {node.marked && <circle cx={p.x} cy={p.y} r={node.size * 0.4} fill="#9BA39B" />}
    </motion.g>
  );
}
