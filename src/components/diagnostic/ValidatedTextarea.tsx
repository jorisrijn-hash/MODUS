"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useDict } from "@/lib/i18n/context";

export function ValidatedTextarea({
  label,
  placeholder,
  value,
  onChange,
  error,
  min,
  max,
  required = true,
  onValidate,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
  min: number;
  max: number;
  required?: boolean;
  onValidate?: () => void;
}) {
  const dict = useDict();
  const [touched, setTouched] = useState(false);
  const showError = touched && error;
  const nearLimit = value.length > max * 0.9;
  const atLimit = value.length >= max;

  return (
    <label className="block">
      <span className="flex items-baseline justify-between">
        <span className="text-[14px] font-medium text-ink">{label}</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted">
          {required ? dict.common.required : dict.common.optional}
        </span>
      </span>
      <textarea
        value={value}
        placeholder={placeholder}
        maxLength={max}
        rows={4}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => {
          setTouched(true);
          onValidate?.();
        }}
        className={`mt-2.5 w-full resize-none rounded border bg-paper px-4 py-3.5 text-[15px] leading-relaxed text-ink outline-none transition-colors placeholder:text-muted ${
          showError ? "border-signal" : "border-line focus:border-modus"
        }`}
      />
      <div className="mt-1.5 flex items-center justify-between">
        <AnimatePresence>
          {showError && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[12.5px] text-signal"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
        <span
          className={`ml-auto font-mono text-[10.5px] transition-colors ${
            atLimit ? "font-medium text-signal" : nearLimit ? "text-graphite" : "text-muted"
          }`}
        >
          {atLimit ? dict.common.maximumReached.toUpperCase() : `${value.length} / ${max}`}
        </span>
      </div>
    </label>
  );
}
