"use client";

import { useState, useSyncExternalStore } from "react";
import { getContextReference, listenContextReferenceChange } from "@/lib/customerContext/storage";
import { CalendlyEmbed } from "@/components/scheduling/CalendlyEmbed";
import { useDict } from "@/lib/i18n/context";
import { track } from "@/lib/chatbot";

const HAS_CALENDLY = Boolean(process.env.NEXT_PUBLIC_CALENDLY_URL);

/**
 * Replaces the old chatbot-only "Review This Estimate With MODUS" dead
 * end: a real Calendly embed to book a time, plus a callback-request form
 * as a fallback/alternative — not either/or. Reads the visitor's own
 * contextToken from local storage (same one GET /api/context/[token]
 * already uses), so it only ever renders downstream of a completed
 * Diagnostic, never asks the visitor to re-identify themselves.
 */
export function ReviewSchedulingPanel({
  token: explicitToken,
  prefill,
}: {
  /** Pass this on the /proposal/[token] page, where the visitor may be
   * opening a shared link on a device/browser that never ran their own
   * Diagnostic, so there's nothing in localStorage to read. Omit it
   * everywhere else and it falls back to the visitor's own stored
   * reference. */
  token?: string;
  prefill?: { name?: string; email?: string };
}) {
  const dict = useDict();
  const t = dict.reviewScheduling;
  // Server-only components never render this panel (it's always downstream
  // of a client-only "does this visitor have a profile" branch), but
  // useSyncExternalStore is still the correct way to read localStorage
  // without a setState-in-effect — same pattern as useCustomerContext.ts.
  const storedToken = useSyncExternalStore(
    listenContextReferenceChange,
    () => getContextReference()?.contextToken ?? null,
    () => null
  );
  const token = explicitToken ?? storedToken;
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setStatus("sending");
    track("callback_requested");
    try {
      const res = await fetch(`/api/context/${token}/callback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className={`grid grid-cols-1 gap-6 ${HAS_CALENDLY ? "sm:grid-cols-[1.2fr_1fr]" : ""}`}>
      {HAS_CALENDLY && (
        <div>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
            {t.bookTime}
          </p>
          <CalendlyEmbed prefill={prefill} />
        </div>
      )}

      <div>
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
          {HAS_CALENDLY ? t.orRequestCallback : t.requestCallback}
        </p>

        {status === "sent" ? (
          <div className="rounded-sm border border-line bg-surface/60 p-5">
            <p className="text-[14px] font-medium text-ink">{t.successTitle}</p>
            <p className="mt-1.5 text-[13px] text-graphite">{t.successBody}</p>
          </div>
        ) : token ? (
          <form onSubmit={handleSubmit} className="rounded-sm border border-line p-5">
            <label htmlFor="callback-note" className="sr-only">
              {t.noteLabel}
            </label>
            <textarea
              id="callback-note"
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 500))}
              placeholder={t.notePlaceholder}
              rows={4}
              className="w-full resize-none rounded-sm border border-line bg-white px-3 py-2.5 text-[13.5px] text-ink placeholder:text-muted focus:border-modus focus:outline-none"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="mt-3 inline-flex items-center gap-2 rounded bg-modus px-5 py-2.5 text-[13.5px] font-medium text-paper transition-colors hover:bg-modus-light disabled:opacity-50"
            >
              {status === "sending" ? t.submitting : t.submit}
            </button>
            {status === "error" && (
              <p className="mt-2 text-[12px] text-signal">{t.errorMessage}</p>
            )}
          </form>
        ) : null}
      </div>
    </div>
  );
}
