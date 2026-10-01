import { type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

/**
 * Base form-field visual primitive — the shared border/radius/height/focus/
 * error contract, factored out of the diagnostic's own ValidatedInput (kept
 * as-is, not refactored to consume this, to avoid touching existing
 * diagnostic files this checkpoint) so new design-system work has a single
 * place to reach for it. `tone="error"` matches ValidatedInput's error
 * state exactly (border-signal); default matches its resting/focus state
 * (border-line, focus:border-modus).
 */
const FIELD_BASE =
  "w-full rounded border bg-paper px-4 text-[15px] text-ink outline-none transition-colors placeholder:text-muted";

const TONE_CLASS = {
  default: "border-line focus:border-modus",
  valid: "border-modus",
  error: "border-signal",
} as const;

type Tone = keyof typeof TONE_CLASS;

export function Input({
  tone = "default",
  className = "",
  ...rest
}: { tone?: Tone; className?: string } & Omit<InputHTMLAttributes<HTMLInputElement>, "className">) {
  return <input {...rest} className={`h-[54px] ${FIELD_BASE} ${TONE_CLASS[tone]} ${className}`} />;
}

export function Textarea({
  tone = "default",
  className = "",
  ...rest
}: { tone?: Tone; className?: string } & Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "className"
>) {
  return (
    <textarea {...rest} className={`min-h-[120px] py-3.5 ${FIELD_BASE} ${TONE_CLASS[tone]} ${className}`} />
  );
}
