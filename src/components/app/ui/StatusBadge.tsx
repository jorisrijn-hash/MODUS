import { type ReactNode } from "react";

const TONES = {
  neutral: "bg-surface text-graphite border-line",
  positive: "bg-modus/8 text-modus border-modus/20",
  warning: "bg-signal/8 text-signal border-signal/20",
  info: "bg-ink/5 text-ink border-line",
} as const;

export function StatusBadge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
