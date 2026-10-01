import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { ThemeSwitch } from "@/components/ui/ThemeSwitch";

// Temporary internal surface for verifying the Checkpoint 1 design-system
// foundation (tokens, theme, type, spacing, primitives) in isolation
// before any real page adopts it. Not linked from nav/footer/sitemap.
// Excluded from indexing explicitly since it's not real content.
export const metadata: Metadata = {
  title: "MODUS — Design System (internal)",
  robots: { index: false, follow: false },
};

function Swatch({ label, className, textClassName = "text-ink" }: { label: string; className: string; textClassName?: string }) {
  return (
    <div className={`flex h-20 flex-col justify-between rounded border border-line p-3 ${className}`}>
      <span className={`font-mono text-[10px] uppercase tracking-[0.08em] ${textClassName}`}>{label}</span>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-paper pb-32 pt-16 text-ink">
      <Container>
        <div className="flex flex-col gap-3 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
          <SectionLabel id="INTERNAL">MODUS Design System — Checkpoint 1</SectionLabel>
          <ThemeSwitch />
        </div>

        {/* Typography */}
        <section className="mt-14">
          <SectionLabel id="01">Typography</SectionLabel>
          <div className="mt-6 space-y-5">
            <p className="text-display-xl font-semibold">Display XL / reserved</p>
            <p className="text-display-lg font-semibold">Display LG — 72/80</p>
            <p className="text-display-md font-semibold">Display MD — 48/56</p>
            <p className="text-display-sm font-semibold">Display SM — 32/40</p>
            <p className="max-w-xl text-[15px] leading-relaxed text-graphite">
              Body text — the existing ad hoc Tailwind sizes (13–16px) used across the
              site, unchanged. This paragraph demonstrates the Body role at its most
              common size, on <code className="font-mono text-[13px]">text-graphite</code>.
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
              Technical / mono — timestamps, labels, system indexes
            </p>
          </div>
        </section>

        {/* Spacing */}
        <section className="mt-14">
          <SectionLabel id="02">Spacing (reserved editorial scale)</SectionLabel>
          <div className="mt-6 space-y-2.5">
            {[
              ["gutter", "1.5rem"],
              ["section-sm", "5rem"],
              ["section", "7rem"],
              ["section-lg", "9rem"],
              ["section-xl", "11rem"],
            ].map(([name, width]) => (
              <div key={name} className="flex items-center gap-3">
                <span className="w-24 shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
                  {name}
                </span>
                <div className="h-3 bg-modus/25" style={{ width }} />
              </div>
            ))}
          </div>
        </section>

        {/* Surfaces */}
        <section className="mt-14">
          <SectionLabel id="03">Surfaces</SectionLabel>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Swatch label="canvas" className="bg-paper" />
            <Swatch label="canvas-secondary" className="bg-mineral" />
            <Swatch label="surface" className="bg-surface" />
            <Swatch label="surface-elevated" className="bg-surface-elevated shadow-2xl" />
          </div>
        </section>

        {/* Borders */}
        <section className="mt-14">
          <SectionLabel id="04">Borders</SectionLabel>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="flex h-16 items-center justify-center rounded border border-line font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
              line
            </div>
            <div className="flex h-16 items-center justify-center rounded border border-line-strong font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
              line-strong
            </div>
          </div>
        </section>

        {/* Accent states */}
        <section className="mt-14">
          <SectionLabel id="05">Accent</SectionLabel>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Swatch label="accent" className="bg-modus" textClassName="text-modus-foreground" />
            <Swatch label="accent-light" className="bg-modus-light" textClassName="text-modus-foreground" />
            <Swatch label="accent-dim" className="bg-modus-dim" textClassName="text-modus-foreground" />
            <Swatch label="accent-soft" className="bg-modus-soft" />
          </div>
          <p className="mt-4 select-all text-[13px] text-graphite">
            Select this line to preview <code className="font-mono text-[12px]">::selection</code> styling
            against the accent tokens.
          </p>
        </section>

        {/* Buttons */}
        <section className="mt-14">
          <SectionLabel id="06">Buttons</SectionLabel>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="primary" size="lg">
              Primary / lg
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
            <Button variant="primary" href="/design-system">
              As link
            </Button>
          </div>
        </section>

        {/* Form fields */}
        <section className="mt-14 max-w-md">
          <SectionLabel id="07">Form fields</SectionLabel>
          <div className="mt-6 space-y-4">
            <Input placeholder="Default state" />
            <Input placeholder="Valid state" tone="valid" />
            <Input placeholder="Error state" tone="error" />
            <Textarea placeholder="Textarea" />
          </div>
        </section>

        {/* Focus */}
        <section className="mt-14">
          <SectionLabel id="08">Focus</SectionLabel>
          <p className="mt-4 text-[12.5px] text-muted">Tab to the button below to check the focus ring.</p>
          <div className="mt-3">
            <Button variant="secondary">Tab to me</Button>
          </div>
        </section>
      </Container>
    </div>
  );
}
