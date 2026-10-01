"use client";

import { motion, AnimatePresence } from "motion/react";
import { useDict, useLocale } from "@/lib/i18n/context";
import { pick } from "@/lib/diagnostic/questions";

function lineStyle(level: string, mostlyConnected: string, mostlyManual: string, someConnections: string) {
  if (level === mostlyConnected) return { dash: undefined, opacity: 0.85 };
  if (level === mostlyManual) return { dash: "2 3", opacity: 0.55 };
  if (level === someConnections) return { dash: "3.5 2", opacity: 0.65 };
  return { dash: "1.5 2.5", opacity: 0.4 };
}

export function SystemMap({
  systems,
  connectionLevel,
}: {
  systems: string[];
  connectionLevel: string;
}) {
  const dict = useDict();
  const { locale } = useLocale();
  const t = dict.diagnosticSystemMap;
  const usingPlaceholders = systems.length === 0;
  const nodes = usingPlaceholders ? t.placeholderCategories : systems;
  const style = lineStyle(
    connectionLevel,
    pick("connectionLevels", "Mostly connected", locale),
    pick("connectionLevels", "Mostly manual", locale),
    pick("connectionLevels", "Some connections", locale)
  );

  const positioned = nodes.map((label, i) => {
    const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    const radius = 39;
    return {
      label,
      x: 50 + radius * Math.cos(angle),
      y: 50 + radius * Math.sin(angle),
    };
  });

  return (
    <div className="relative aspect-square w-full max-w-[280px] mx-auto">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
        <AnimatePresence>
          {!usingPlaceholders &&
            positioned.map((n) => (
              <motion.line
                key={`line-${n.label}`}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: style.opacity }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                x1={50}
                y1={50}
                x2={n.x}
                y2={n.y}
                stroke="#123C2D"
                strokeWidth="0.75"
                strokeDasharray={style.dash}
                vectorEffect="non-scaling-stroke"
              />
            ))}
        </AnimatePresence>
        {usingPlaceholders &&
          positioned.map((n) => (
            <line
              key={`line-${n.label}`}
              x1={50}
              y1={50}
              x2={n.x}
              y2={n.y}
              stroke="#D9DCD7"
              strokeWidth="0.75"
              strokeDasharray="1.5 2.5"
              vectorEffect="non-scaling-stroke"
            />
          ))}
      </svg>

      <div
        className="absolute rounded-full border border-modus bg-ink px-3 py-2 font-mono text-[9px] uppercase tracking-[0.06em] text-paper"
        style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
      >
        {t.businessLabel}
      </div>

      <AnimatePresence>
        {positioned.map((n) => (
          <motion.div
            key={n.label}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-sm border px-2 py-1 font-mono text-[8.5px] uppercase tracking-[0.04em] ${
              usingPlaceholders
                ? "border-line text-muted/60"
                : "border-modus/40 bg-paper text-graphite"
            }`}
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
          >
            {n.label}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
