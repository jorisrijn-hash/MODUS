"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { Input } from "@/components/ui/Input";
import { DiagnosticCTA } from "@/components/ui/DiagnosticCTA";
import { useDict } from "@/lib/i18n/context";

/**
 * Checkpoint 4, Section 6 — a MODUS-specific reinterpretation of the
 * reference's large AI-prompt interaction, not a chat. Deliberately kept
 * as a **visual entry interaction only**, per the brief's own explicit
 * safety clause: wiring the typed text/selected category into the real
 * diagnostic state machine would mean either (a) writing into
 * `sessionStorage` under `DiagnosticShell`'s own `modus:diagnostic:v1`
 * key before navigating — which would incorrectly trigger its "resume a
 * saved draft?" recovery prompt on arrival, since that prompt fires for
 * *any* non-empty saved state, not just a genuine resumed session — or
 * (b) adding new state-machine plumbing to `DiagnosticShell` this
 * checkpoint has no mandate to touch. Both are exactly the "risky
 * business-logic change" the brief says to avoid; the fallback it
 * explicitly sanctions instead is what's built here: the input and
 * category selection are real, interactive, and visually responsive, but
 * simply route to `/diagnostic` on submit — the flagship flow itself is
 * completely untouched.
 *
 * Checkpoint 5, Section 13 adds exactly one low-risk exception: the
 * selected category (not the free-typed text) is passed to `/diagnostic`
 * as a `?hint=` query param via `DiagnosticCTA`'s `hint` prop, shown there
 * purely as a non-authoritative acknowledgment on the intro screen. Still
 * never touches `sessionStorage`, `DiagnosticAnswers`, or `canProceed`.
 */
export function DiagnosticEntry() {
  const dict = useDict();
  const t = dict.home.diagnosticEntry;
  const [value, setValue] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  return (
    <section className="border-t border-line bg-mineral py-24 md:py-32">
      <Container>
        <div className="mx-auto max-w-2xl">
          <Reveal className="flex justify-center">
            <SectionLabel id="SYS / 02">{t.label}</SectionLabel>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-5 text-balance text-center text-display-sm font-semibold text-ink md:text-display-md">
              {t.heading}
            </h2>
          </Reveal>

          <Reveal delay={0.14}>
            <form
              className="mt-10 rounded-lg border border-line bg-paper p-2 shadow-2xl"
              onSubmit={(e) => e.preventDefault()}
            >
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={t.placeholder}
                aria-label={t.heading}
                className="border-none px-4 shadow-none focus:border-none"
              />
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-3 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  {t.categories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory((cur) => (cur === c ? null : c))}
                      aria-pressed={category === c}
                      className={`rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.06em] transition-colors ${
                        category === c
                          ? "border-modus bg-modus text-modus-foreground"
                          : "border-line text-muted hover:border-ink/30 hover:text-ink"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <DiagnosticCTA variant="inline" source="homepage_entry" hint={category ?? undefined} />
              </div>
            </form>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
