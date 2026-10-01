"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";

export function OptionGrid({
  options,
  selected,
  onToggle,
  columns = 2,
  max,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  columns?: 2 | 3 | 4;
  max?: number;
}) {
  const colClass =
    columns === 4
      ? "sm:grid-cols-4"
      : columns === 3
        ? "sm:grid-cols-3"
        : "sm:grid-cols-2";

  return (
    <div className={`grid grid-cols-1 gap-2.5 ${colClass}`}>
      {options.map((opt) => {
        const isSelected = selected.includes(opt);
        const disabled = !isSelected && !!max && selected.length >= max;
        return (
          <motion.button
            key={opt}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(opt)}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center justify-between gap-3 rounded border px-4 py-3.5 text-left text-[14px] transition-colors duration-200 ${
              isSelected
                ? "border-modus bg-modus/5 text-modus"
                : disabled
                  ? "border-line text-muted/50"
                  : "border-line text-graphite hover:border-modus/50"
            }`}
          >
            <span>{opt}</span>
            <motion.span
              initial={false}
              animate={{ scale: isSelected ? 1 : 0, opacity: isSelected ? 1 : 0 }}
              transition={{ duration: 0.18 }}
              className="shrink-0"
            >
              <Check className="h-4 w-4" strokeWidth={2.25} />
            </motion.span>
          </motion.button>
        );
      })}
    </div>
  );
}
