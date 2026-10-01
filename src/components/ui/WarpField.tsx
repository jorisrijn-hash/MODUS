"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { X } from "lucide-react";

type WarpTarget = {
  id: string;
  x: number; // 0-1, focal point as a fraction of the field's own box
  y: number;
  label: ReactNode;
  title: ReactNode;
  content: ReactNode;
};

type WarpFieldApi = {
  open: (opts: { triggerEl: HTMLElement; id: string; label: ReactNode; title: ReactNode; content: ReactNode }) => void;
  close: () => void;
  activeId: string | null;
};

const WarpFieldContext = createContext<WarpFieldApi | null>(null);

export function useWarpField(): WarpFieldApi {
  const ctx = useContext(WarpFieldContext);
  if (!ctx) throw new Error("useWarpField must be called inside a <WarpField>");
  return ctx;
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

/**
 * MODUS "Warp Overlay": clicking a registered node inside this field
 * doesn't open a floating modal — the field's own content (everything
 * passed as `children`) physically warps: it scales toward the clicked
 * point (so the focal point stays put and everything else visibly gets
 * pulled toward it, more so the farther away it is — that's just what
 * `transform-origin` + `scale` does for free, no per-node math needed)
 * while an SVG turbulence/displacement filter ripples it and a blur
 * builds on top. The inspection panel then resolves in, sharp, as an
 * unfiltered sibling layer so it stays readable while the field behind
 * it is still warped. Closing reverses the whole thing.
 *
 * Scoped to whatever this wraps (a single diagram), not the page — "MODUS
 * places a lens over the workflow," not over the whole site.
 */
export function WarpField({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();
  const fieldRef = useRef<HTMLDivElement>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null);
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const filterId = `warp-${rawId}`;

  const [target, setTarget] = useState<WarpTarget | null>(null);
  const [closing, setClosing] = useState(false);
  const progress = useMotionValue(0); // 0 = at rest, 1 = fully warped

  const open = useCallback<WarpFieldApi["open"]>((opts) => {
    const fieldEl = fieldRef.current;
    if (!fieldEl) return;
    const fieldRect = fieldEl.getBoundingClientRect();
    const triggerRect = opts.triggerEl.getBoundingClientRect();
    const x = fieldRect.width ? (triggerRect.left + triggerRect.width / 2 - fieldRect.left) / fieldRect.width : 0.5;
    const y = fieldRect.height ? (triggerRect.top + triggerRect.height / 2 - fieldRect.top) / fieldRect.height : 0.5;
    lastTriggerRef.current = opts.triggerEl;
    setClosing(false);
    setTarget({ id: opts.id, x: clamp01(x), y: clamp01(y), label: opts.label, title: opts.title, content: opts.content });
  }, []);

  const close = useCallback(() => setClosing(true), []);

  useEffect(() => {
    if (!target) return;
    const controls = animate(progress, closing ? 0 : 1, {
      duration: reduceMotion ? 0.15 : closing ? 0.5 : 0.55,
      ease: reduceMotion ? "linear" : closing ? [0.65, 0, 0.35, 1] : [0.16, 1, 0.3, 1],
    });
    if (closing) {
      const t = setTimeout(
        () => {
          setTarget(null);
          setClosing(false);
          lastTriggerRef.current?.focus?.();
        },
        reduceMotion ? 150 : 500
      );
      return () => {
        controls.stop();
        clearTimeout(t);
      };
    }
    return () => controls.stop();
  }, [target, closing, reduceMotion, progress]);

  useEffect(() => {
    if (!target) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [target, close]);

  useMotionValueEvent(progress, "change", (v) => {
    displacementRef.current?.setAttribute("scale", String(v * 22));
  });

  const blur = useTransform(progress, [0, 1], [0, reduceMotion ? 0 : 6]);
  const scale = useTransform(progress, [0, 1], [1, reduceMotion ? 1 : 0.93]);
  const filterStyle = useMotionTemplate`blur(${blur}px) url(#${filterId})`;

  return (
    <WarpFieldContext.Provider value={{ open, close, activeId: target && !closing ? target.id : null }}>
      <div ref={fieldRef} className={`relative ${className}`}>
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
          <defs>
            <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.01 0.015" numOctaves="2" seed="7" result="noise" />
              <feDisplacementMap
                ref={displacementRef}
                in="SourceGraphic"
                in2="noise"
                scale="0"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>

        <motion.div
          style={{
            scale,
            filter: filterStyle,
            transformOrigin: target ? `${target.x * 100}% ${target.y * 100}%` : "50% 50%",
            pointerEvents: target ? "none" : "auto",
          }}
        >
          {children}
        </motion.div>

        <AnimatePresence>
          {target && !closing && (
            <FocalPanel key={target.id} target={target} onClose={close} reduceMotion={!!reduceMotion} />
          )}
        </AnimatePresence>
      </div>
    </WarpFieldContext.Provider>
  );
}

function FocalPanel({
  target,
  onClose,
  reduceMotion,
}: {
  target: WarpTarget;
  onClose: () => void;
  reduceMotion: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  return (
    <div
      className="absolute inset-0 z-[70] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-label={typeof target.title === "string" ? target.title : undefined}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
        transition={{ duration: reduceMotion ? 0.15 : 0.35, ease: [0.16, 1, 0.3, 1], delay: reduceMotion ? 0 : 0.1 }}
        className="relative w-full max-w-md border border-modus/40 bg-paper shadow-none outline-none"
      >
        <span className="reg-mark -left-1 -top-1" />
        <span className="reg-mark -right-1 -top-1" />
        <span className="reg-mark -bottom-1 -left-1" />
        <span className="reg-mark -bottom-1 -right-1" />

        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-modus">{target.label}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-muted hover:text-ink"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
        {target.title && (
          <p className="border-b border-line px-5 py-3 text-[15px] font-medium text-ink">{target.title}</p>
        )}
        <div className="px-5 py-4">{target.content}</div>
      </motion.div>
    </div>
  );
}
