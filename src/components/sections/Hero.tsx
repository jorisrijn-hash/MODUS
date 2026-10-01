"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { DiagnosticCTA } from "@/components/ui/DiagnosticCTA";
import { HomeContextBanner } from "@/components/customerContext/HomeContextBanner";
import { useDict } from "@/lib/i18n/context";

/**
 * Checkpoint 5.5, third pass — composition rebuilt against the supplied
 * reference hero rather than against the previous MODUS hero.
 *
 * What changed from the second pass, and why:
 *
 * - The headline is **centred**, not left-anchored. The second pass kept
 *   a left column, which is why the blurred-silhouette test still read
 *   as "left content / right background" instead of one composition.
 *   One word is italicised, matching the reference's own editorial
 *   emphasis device.
 * - The diagnostic shell is **centred and much wider** (~46% of the
 *   viewport at desktop, up from a 576px card pinned left), so it reads
 *   as a large floating interface object balancing the headline rather
 *   than a form sitting under it. Its internal hierarchy follows the
 *   reference: spacious input first, small chips along the lower edge,
 *   one compact circular forward action — no large rectangular button
 *   inside the shell.
 * - Supporting copy sits low-left as quiet annotation; the scroll cue
 *   sits low-centre-right. Both are deliberately far from the headline,
 *   preserving the reference's separation between the three.
 *
 * The shell stays a *visual entry* to the Free Diagnostic — it is not
 * chat, not AI generation. Typed text is not submitted anywhere; the
 * selected category is passed to `/diagnostic` only as a
 * non-authoritative `?hint=` param, exactly as before. The real
 * diagnostic state machine is untouched.
 */
export function Hero() {
  const dict = useDict();
  const t = dict.home.hero;
  const te = dict.home.diagnosticEntry;
  const [value, setValue] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const words = t.headline.split(" ");
  const mid = Math.ceil(words.length / 2);
  const lineOne = words.slice(0, mid).join(" ");
  const lineTwoWords = words.slice(mid);

  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden pb-16 pt-36 md:pt-40">
      <Container className="flex flex-1 flex-col items-center">
        <Reveal delay={0.08}>
          <h1 className="max-w-5xl text-center text-display-xl font-semibold leading-[1.02] text-ink">
            <span className="block">{lineOne}</span>
            <span className="block">
              {lineTwoWords.map((w, i) => (
                <span key={w + i} className={i === 0 ? "italic" : undefined}>
                  {w}
                  {i < lineTwoWords.length - 1 ? " " : ""}
                </span>
              ))}
            </span>
          </h1>
        </Reveal>

        <Reveal delay={0.24} className="w-full">
          {/* Forced-light surface in both themes — the reference's own
              shell stays bright against its light *and* dark hero, which
              is what makes it read as a floating object rather than a
              panel belonging to the page. */}
          <form
            className="mx-auto mt-14 w-full max-w-[46rem] rounded-2xl border border-black/[0.07] bg-white/95 p-3 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.28)] backdrop-blur-md"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={te.placeholder}
              aria-label={te.heading}
              className="h-16 w-full rounded-xl bg-transparent px-5 text-[16px] text-neutral-900 outline-none placeholder:text-neutral-400"
            />
            <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-1 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                {te.categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory((cur) => (cur === c ? null : c))}
                    aria-pressed={category === c}
                    className={`rounded-full border px-3.5 py-1.5 text-[12.5px] transition-colors ${
                      category === c
                        ? "border-modus bg-modus text-modus-foreground"
                        : "border-black/10 bg-black/[0.02] text-neutral-600 hover:border-black/25 hover:text-neutral-900"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <DiagnosticCTA
                variant="hero-round"
                source="hero_entry"
                hint={category ?? undefined}
                magnetic
                icon={<ArrowRight className="h-4 w-4" strokeWidth={2} />}
              />
            </div>
          </form>
        </Reveal>

        <HomeContextBanner />

        <div className="mt-auto flex w-full items-end justify-between gap-8 pt-14">
          <Reveal delay={0.42}>
            <p className="max-w-[20rem] text-[13.5px] leading-relaxed text-graphite">{t.body}</p>
          </Reveal>

          <Reveal delay={0.5}>
            <span className="flex h-10 w-6 shrink-0 items-start justify-center rounded-full border border-line/70 pt-2">
              <span className="h-2 w-px rounded-full bg-muted" />
            </span>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
