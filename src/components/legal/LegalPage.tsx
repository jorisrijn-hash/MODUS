import Link from "next/link";
import { type ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { LogoGlyph } from "@/components/ui/Logo";

export type LegalSection = { id: string; heading: string; body: ReactNode };

/**
 * Shared shell for /legal and /privacypolicy.
 *
 * Semantic HTML throughout — real headings, real lists, real `mailto:`
 * links. Deliberately not a PDF embed or a screenshot: these pages must be
 * selectable, searchable, linkable by anchor, translatable and printable.
 *
 * Measure is held at ~68 characters via `max-w-[68ch]`, which tracks the
 * font rather than a fixed pixel width.
 */
export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: ReactNode;
  sections: LegalSection[];
}) {
  return (
    <main className="pb-28 pt-32 md:pt-40">
      <Container>
        <div className="lg:flex lg:gap-16">
          {/* Anchor navigation: a sidebar on desktop, a collapsed <details>
              on mobile so it never pushes the document itself down a
              screenful. */}
          <nav aria-label="Contents" className="mb-10 lg:order-2 lg:mb-0 lg:w-56 lg:shrink-0">
            <details className="lg:hidden">
              <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                Contents
              </summary>
              <ol className="mt-4 space-y-2">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="text-[13.5px] text-graphite hover:text-ink">
                      {i + 1}. {s.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </details>
            <ol className="hidden lg:sticky lg:top-28 lg:block lg:space-y-2">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-[13px] text-graphite hover:text-ink">
                    {i + 1}. {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="min-w-0 max-w-[68ch] lg:order-1 lg:flex-1">
            <Link href="/" aria-label="MODUS" className="inline-block">
              <LogoGlyph className="h-7 w-7 text-ink" />
            </Link>
            <h1 className="mt-8 font-serif text-display-section text-ink">{title}</h1>
            <p className="mt-3 font-mono text-[11.5px] uppercase tracking-[0.14em] text-muted">
              Last updated: {updated}
            </p>
            <div className="legal-prose mt-10">{intro}</div>

            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="legal-prose mt-12 scroll-mt-28">
                <h2 className="font-serif text-[22px] text-ink md:text-[26px]">
                  {i + 1}. {s.heading}
                </h2>
                {s.body}
              </section>
            ))}
          </article>
        </div>
      </Container>
    </main>
  );
}

/** `mailto:` link whose visible text and destination are always identical. */
export function Mail({ address }: { address: string }) {
  return (
    <a href={`mailto:${address}`} className="text-modus underline underline-offset-2">
      {address}
    </a>
  );
}
