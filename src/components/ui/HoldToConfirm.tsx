"use client";

import { useRef, useState, type PointerEvent } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  animate,
  type AnimationPlaybackControls,
} from "motion/react";

const HOLD_SECONDS = 1.1;

type Status = "idle" | "holding" | "complete";

export function HoldToConfirm({
  onConfirm,
  idleLabel = "Hold to Start Diagnostic",
  holdingLabel = "Initializing",
  completeLabel = "Diagnostic Initialized",
}: {
  onConfirm: () => void;
  idleLabel?: string;
  holdingLabel?: string;
  completeLabel?: string;
}) {
  const reduceMotion = useReducedMotion();
  const progress = useMotionValue(0);
  const controls = useRef<AnimationPlaybackControls | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  function complete() {
    setStatus("complete");
    window.setTimeout(() => {
      onConfirm();
      setStatus("idle");
      progress.set(0);
    }, 550);
  }

  // Pointer Capture, not onPointerLeave — a real bug found live via
  // Playwright (not just a test artifact): if page content above this
  // button shifts height while the hold is in progress (e.g. the consent
  // banner's own entrance reveal landing mid-hold — confirmed as the
  // exact trigger), the button moves out from under a stationary
  // pointer, onPointerLeave fires, and the hold silently cancels with no
  // explanation. A real visitor's cursor doesn't move in that scenario —
  // only the button does — so this is a genuine interaction bug, not
  // just a timing coincidence in tests. setPointerCapture is the
  // standard DOM API for exactly this class of interaction (the same
  // mechanism drag/slider controls use): once captured, this element
  // keeps receiving this pointer's events regardless of where it visually
  // ends up, until the pointer is actually released.
  function start(e: PointerEvent<HTMLButtonElement>) {
    if (status === "complete") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    if (reduceMotion) {
      complete();
      return;
    }
    setStatus("holding");
    controls.current?.stop();
    controls.current = animate(progress, 1, {
      duration: HOLD_SECONDS,
      ease: "linear",
      onComplete: complete,
    });
  }

  function release() {
    if (status !== "holding") return;
    setStatus("idle");
    controls.current?.stop();
    controls.current = animate(progress, 0, {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    });
  }

  const label =
    status === "complete"
      ? completeLabel
      : status === "holding"
        ? holdingLabel
        : idleLabel;

  return (
    <button
      type="button"
      onPointerDown={start}
      onPointerUp={release}
      onPointerCancel={release}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          complete();
        }
      }}
      className="group relative isolate w-full max-w-xs overflow-hidden rounded border border-line bg-paper px-6 py-4 text-left select-none sm:w-auto sm:min-w-[280px]"
    >
      <motion.span
        style={{ scaleX: progress }}
        className="absolute inset-0 -z-10 origin-left bg-modus"
      />
      <span className="flex items-center justify-between gap-4">
        <span
          className={`font-mono text-[13px] uppercase tracking-[0.08em] transition-colors duration-200 ${
            status === "idle" ? "text-ink" : "text-paper"
          }`}
        >
          {label}
        </span>
        <span
          className={`font-mono text-[11px] transition-colors duration-200 ${
            status === "idle" ? "text-muted" : "text-paper/70"
          }`}
        >
          {status === "complete" ? "100%" : status === "holding" ? "hold…" : "press"}
        </span>
      </span>
    </button>
  );
}
