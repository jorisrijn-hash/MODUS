"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { validatePhone } from "@/lib/diagnostic/schema";
import { useDict } from "@/lib/i18n/context";

export function PhoneInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const dict = useDict();
  const [touched, setTouched] = useState(false);
  const result = value.trim() ? validatePhone(value) : { valid: true, formatted: "" };
  const showError = touched && value.trim() && !result.valid;
  const showValid = touched && value.trim() && result.valid;

  return (
    <label className="block">
      <span className="flex items-baseline justify-between">
        <span className="text-[14px] font-medium text-ink">{dict.phoneInput.label}</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted">
          {dict.common.optional}
        </span>
      </span>
      <input
        type="tel"
        value={value}
        placeholder="06 12345678"
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        className={`mt-2.5 h-[54px] w-full rounded border bg-paper px-4 text-[15px] text-ink outline-none transition-colors placeholder:text-muted ${
          showError ? "border-signal" : showValid ? "border-modus" : "border-line focus:border-modus"
        }`}
      />
      <AnimatePresence>
        {showValid && result.formatted && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-modus"
          >
            {dict.phoneInput.validPrefix} &middot; {result.formatted}
          </motion.p>
        )}
        {showError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-1.5 text-[12.5px] text-signal"
          >
            {dict.phoneInput.invalidMessage}
          </motion.p>
        )}
      </AnimatePresence>
    </label>
  );
}
