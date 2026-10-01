"use client";

import { InlineWidget } from "react-calendly";

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL;

/**
 * Renders nothing if NEXT_PUBLIC_CALENDLY_URL isn't set, rather than a
 * broken/empty widget — matches the project's "never show a dead state as
 * if it works" discipline. The callback-request form next to this is the
 * fallback either way, so an unconfigured link degrades gracefully.
 */
export function CalendlyEmbed({
  prefill,
}: {
  prefill?: { name?: string; email?: string };
}) {
  if (!CALENDLY_URL) return null;

  return (
    <div className="overflow-hidden rounded-sm border border-line">
      <InlineWidget
        url={CALENDLY_URL}
        prefill={prefill}
        styles={{ height: "680px", width: "100%" }}
      />
    </div>
  );
}
