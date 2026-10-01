"use client";

import { useState, type InputHTMLAttributes } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";
import { useDict } from "@/lib/i18n/context";

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
  required?: boolean;
  maxLength?: number;
  onValidate?: () => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "onBlur">;

export function ValidatedInput({
  label,
  value,
  onChange,
  error,
  required = false,
  maxLength,
  onValidate,
  ...rest
}: Props) {
  const dict = useDict();
  const [touched, setTouched] = useState(false);
  const showError = touched && error;
  const showValid = touched && !error && value.trim().length > 0;

  return (
    <label className="block">
      <span className="flex items-baseline justify-between">
        <span className="text-[14px] font-medium text-ink">{label}</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted">
          {required ? dict.common.required : dict.common.optional}
        </span>
      </span>
      <div className="relative mt-2.5">
        <input
          {...rest}
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => {
            setTouched(true);
            onValidate?.();
          }}
          className={`h-[54px] w-full rounded border bg-paper px-4 pr-10 text-[15px] text-ink outline-none transition-colors placeholder:text-muted ${
            showError
              ? "border-signal"
              : showValid
                ? "border-modus"
                : "border-line focus:border-modus"
          }`}
        />
        <AnimatePresence>
          {showValid && (
            <motion.span
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-modus"
            >
              <Check className="h-4 w-4" strokeWidth={2} />
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {showError && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-1.5 text-[12.5px] text-signal"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </label>
  );
}
