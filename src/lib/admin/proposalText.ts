import type { ParsedDiagnostic } from "./types";

/**
 * The copyable "official price proposal + backup info" block — what a
 * human pastes into an email or proposal document. Always includes the
 * reasoning behind the number, not just the number itself, so the figure
 * is never presented without its justification.
 */
export function buildProposalText(
  d: ParsedDiagnostic,
  finalAmount: number | null,
  finalImplementationFee: number | null,
  finalNote: string
): string {
  const lines = [
    `MODUS × ${d.companyName} — Price Proposal`,
    "",
    "OFFICIAL PROPOSAL",
    finalAmount != null ? `€${finalAmount.toLocaleString("en-GB")} / month` : "Monthly amount not yet set",
    finalImplementationFee != null
      ? `€${finalImplementationFee.toLocaleString("en-GB")} one-time implementation`
      : null,
    finalNote ? `Note: ${finalNote}` : null,
    "",
    "BACKUP INFO",
    `Pricing model: ${d.pricingVersion ?? "unknown"}`,
    `Band: ${d.pricingBand ?? "unknown"} (complexity ${d.complexityScoreTotal ?? "?"}/22)`,
    `Implementation scope: ${d.implementationScope ?? "unknown"}`,
    d.manualScopeRequired ? "Requires manual scoping — outside the automatic estimate range." : null,
    d.calculatedEstimateMin != null
      ? `System-calculated range: €${d.calculatedEstimateMin.toLocaleString("en-GB")}–€${d.calculatedEstimateMax?.toLocaleString("en-GB")}/month`
      : null,
    d.pricingFactors
      ? `Factors: Business Scale ${d.pricingFactors.businessScale}, System Fragmentation ${d.pricingFactors.systemFragmentation}, Operational Complexity ${d.pricingFactors.operationalComplexity}, Implementation Scope ${d.pricingFactors.implementationScope}`
      : null,
    ...d.pricingReasoning.map((r) => `- ${r}`),
  ].filter((line): line is string => line !== null);

  return lines.join("\n");
}
