import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { parseDiagnostic } from "@/lib/admin/types";
import { buildClientSummary } from "@/lib/admin/clientSummary";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Logo } from "@/components/ui/Logo";
import { ReviewSchedulingPanel } from "@/components/scheduling/ReviewSchedulingPanel";
import { PRICING_CONFIG } from "@/lib/pricing/config";

export const metadata: Metadata = {
  title: "Your MODUS Proposal",
  robots: { index: false, follow: false },
};

// Deliberately no full Navigation/Footer/marketing chrome here — this is
// meant to read as a private document prepared for one specific business,
// not another marketing page (see BRIEF's "Proposal Experience" section:
// "private, specific, considered, high-trust").
export default async function ProposalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const record = await prisma.diagnostic.findUnique({ where: { contextToken: token } });

  // Same 404-regardless-of-reason rule as GET /api/context/[token]: a
  // wrong token and a diagnostic whose proposal was never sent look
  // identical to a visitor — a draft finalProposalAmount must never be
  // reachable here before an admin explicitly sends it.
  if (!record || !record.proposalSentAt) notFound();

  const diagnostic = parseDiagnostic(record);
  const clientSummary = buildClientSummary(diagnostic);
  const sentDate = diagnostic.proposalSentAt!.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-paper">
      <Container className="flex items-center justify-between py-6">
        <Link href="/" aria-label="MODUS home">
          <Logo variant="primary" size="md" />
        </Link>
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">Private / Prepared for You</p>
      </Container>

      <Container className="max-w-3xl pb-24 pt-8">
        <SectionLabel id="SYS / 052">{`MODUS × ${diagnostic.companyName}`}</SectionLabel>
        <h1 className="mt-5 text-balance text-display-md font-semibold text-ink">
          A proposal, prepared specifically for {diagnostic.companyName}.
        </h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-graphite">
          Based on your MODUS Diagnostic and sent to you directly on {sentDate}. This isn&apos;t a generic
          quote — everything below reflects what you told us.
        </p>

        <section className="mt-14 border-t border-line pt-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">What We Understand</p>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-graphite">
            {clientSummary.executiveSummary}
          </p>
        </section>

        <section className="mt-12 border-t border-line pt-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">Where We Would Start</p>
          <ol className="mt-4 space-y-3">
            {clientSummary.propositionPlan.map((item, i) => (
              <li key={item} className="flex gap-4">
                <span className="font-mono text-[11px] text-muted">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[14.5px] leading-relaxed text-ink">{item}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12 rounded-md border border-line bg-white p-6 sm:p-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-modus">Proposed Engagement</p>
          {diagnostic.finalProposalAmount != null && (
            <p className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">
              €{diagnostic.finalProposalAmount.toLocaleString("en-GB")}
              <span className="text-base font-normal text-muted"> / month</span>
            </p>
          )}
          {diagnostic.finalImplementationFee != null && (
            <p className="mt-2 text-[14.5px] text-graphite">
              + €{diagnostic.finalImplementationFee.toLocaleString("en-GB")} one-time implementation
              <span className="ml-2 text-[12px] text-muted">
                (indicative range €{PRICING_CONFIG.initialImplementation.indicativeMin.toLocaleString("en-GB")}–€
                {PRICING_CONFIG.initialImplementation.indicativeMax.toLocaleString("en-GB")})
              </span>
            </p>
          )}
          {diagnostic.finalProposalNote && (
            <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-graphite">{diagnostic.finalProposalNote}</p>
          )}
        </section>

        <section className="mt-12 border-t border-line pt-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">Next Step</p>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-graphite">
            Book a time to go through this together, or ask MODUS to call you.
          </p>
          <div className="mt-6">
            <ReviewSchedulingPanel
              token={diagnostic.contextToken ?? undefined}
              prefill={{
                name: `${diagnostic.firstName} ${diagnostic.lastName}`.trim() || undefined,
                email: diagnostic.email || undefined,
              }}
            />
          </div>
        </section>

        <p className="mt-14 text-[12px] text-muted">
          Prepared by MODUS for {diagnostic.firstName} {diagnostic.lastName} at {diagnostic.companyName}. Questions
          before then? Reach MODUS directly at{" "}
          <a href="mailto:hello@modus.example.com" className="underline decoration-line underline-offset-4 hover:text-graphite">
            hello@modus.example.com
          </a>
          .
        </p>
      </Container>
    </main>
  );
}
