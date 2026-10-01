import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import type { CustomerContextSummary } from "@/lib/customerContext/types";

// Public, unauthenticated, by design: the token itself (a random 32-byte
// value, not the row's id) is the access control. No login exists for
// Diagnostic submitters, and requiring one here would defeat the point —
// see the Diagnostic.contextToken schema comment.
export async function GET(_request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const diagnostic = await prisma.diagnostic.findUnique({
    where: { contextToken: token },
    select: {
      companyName: true,
      createdAt: true,
      preliminarySignals: true,
      calculatedEstimateMin: true,
      calculatedEstimateMax: true,
      manualScopeRequired: true,
      pricingBand: true,
      pricingFactors: true,
      proposalSentAt: true,
    },
  });

  // Always 404 for anything unresolvable — malformed token or genuinely
  // absent, no need to distinguish (nothing useful to a caller either way).
  if (!diagnostic) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  let signalsCount = 0;
  try {
    signalsCount = (JSON.parse(diagnostic.preliminarySignals) as unknown[]).length;
  } catch {
    signalsCount = 0;
  }

  let parsedFactors: {
    businessScale: "low" | "moderate" | "high";
    systemFragmentation: "low" | "moderate" | "high";
    operationalComplexity: "low" | "moderate" | "high";
    implementationScope: "low" | "moderate" | "high";
  } | null = null;
  try {
    parsedFactors = diagnostic.pricingFactors ? JSON.parse(diagnostic.pricingFactors) : null;
  } catch {
    parsedFactors = null;
  }

  const summary: CustomerContextSummary = {
    companyName: diagnostic.companyName,
    submittedAt: diagnostic.createdAt.toISOString(),
    signalsCount,
    proposalUrl: diagnostic.proposalSentAt ? `/proposal/${token}` : null,
    estimate:
      diagnostic.calculatedEstimateMin != null && diagnostic.calculatedEstimateMax != null && parsedFactors
        ? {
            min: diagnostic.calculatedEstimateMin,
            max: diagnostic.calculatedEstimateMax,
            manualScope: diagnostic.manualScopeRequired,
            band: diagnostic.pricingBand ?? "",
            factors: parsedFactors,
          }
        : null,
  };

  return NextResponse.json(summary, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
