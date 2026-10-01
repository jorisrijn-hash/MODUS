import type { ParsedDiagnostic } from "./types";

export type ClientSummary = {
  executiveSummary: string;
  propositionPlan: string[];
};

/**
 * Deterministic, composed entirely from what the business actually
 * submitted plus the already-computed rule-based Signals and pricing
 * output — no external model call, nothing invented. "AI summary" in the
 * product sense (a synthesized narrative that reads like MODUS actually
 * understood the business), not a literal LLM call — see BRIEF_CHECKLIST.md
 * for why, and how to wire in a real one later if that's specifically
 * wanted. Written for a human to skim before writing to (or talking with)
 * the client, or to lift phrasing from directly.
 */
export function buildClientSummary(d: ParsedDiagnostic): ClientSummary {
  const industry = d.industry || "business";
  const scale =
    d.locations && d.locations !== "1" && d.locations !== "Online only"
      ? `operating across ${d.locations} locations`
      : "operating from a single location";

  const channels = d.customerChannels.length > 0 ? d.customerChannels.join(", ") : "unspecified channels";
  const systemsPhrase =
    d.systems.length > 0
      ? `relies on ${d.systems.length} distinct system${d.systems.length === 1 ? "" : "s"}${
          d.specificTools ? ` (${d.specificTools})` : ""
        }`
      : "did not identify specific systems in use";

  const topSignal = d.preliminarySignals[0]?.headline;
  const signalsPhrase =
    d.preliminarySignals.length > 0
      ? `The diagnostic surfaced ${d.preliminarySignals.length} preliminary Signal${
          d.preliminarySignals.length === 1 ? "" : "s"
        }, most notably ${topSignal?.toLowerCase()}.`
      : "The diagnostic did not trigger a strong rule-based Signal on its own — worth a closer manual look.";

  const pricingPhrase =
    d.calculatedEstimateMin != null
      ? d.manualScopeRequired
        ? `Complexity places this outside the automatic estimate range, starting from €${d.calculatedEstimateMin.toLocaleString(
            "en-GB"
          )}/month — a manually-scoped engagement.`
        : `Initial classification lands in the "${d.pricingBand}" band, roughly €${d.calculatedEstimateMin?.toLocaleString(
            "en-GB"
          )}–€${d.calculatedEstimateMax?.toLocaleString("en-GB")}/month.`
      : "No pricing estimate is available for this submission.";

  const executiveSummary = [
    `${d.companyName} is a ${d.employees}-employee ${industry.toLowerCase()} business, ${scale}. Customers reach them through ${channels}, and the business ${systemsPhrase}, describing connectivity between them as "${d.systemConnectivity.toLowerCase()}".`,
    `The primary friction flagged was ${d.primaryPainPoint || "not specified"}${
      d.problemFrequency ? `, occurring ${d.problemFrequency.toLowerCase()}` : ""
    }. ${signalsPhrase}`,
    pricingPhrase,
  ].join(" ");

  const propositionPlan = buildPropositionPlan(d);

  return { executiveSummary, propositionPlan };
}

function buildPropositionPlan(d: ParsedDiagnostic): string[] {
  const plan: string[] = [];

  // Ordered by the client's own stated priority ranking where one exists —
  // this is meant to read as "what MODUS would do for you", not an
  // internal task list, so it leads with their words, not ours.
  const priority = d.priorities[0];
  if (priority) {
    plan.push(`Address "${priority}" first — the improvement ${d.companyName} itself ranked highest.`);
  }

  if (d.primaryPainPoint) {
    plan.push(`Map and resolve the "${d.primaryPainPoint}" friction identified during the diagnostic.`);
  }

  if (d.systemConnectivity && d.systemConnectivity.toLowerCase().includes("manual") && d.systems.length > 1) {
    plan.push(`Reduce manual handoffs between the ${d.systems.length} systems currently in use.`);
  }

  const secondSignal = d.preliminarySignals[1]?.headline;
  if (secondSignal) {
    plan.push(`Validate and, if confirmed, act on: ${secondSignal.toLowerCase()}.`);
  }

  plan.push("Establish a measurement baseline before implementation begins, so improvement is provable, not assumed.");

  return plan;
}

export function clientSummaryToText(summary: ClientSummary, companyName: string): string {
  return [
    `MODUS × ${companyName} — Summary`,
    "",
    "WHAT WE UNDERSTAND",
    summary.executiveSummary,
    "",
    "WHERE WE WOULD START",
    ...summary.propositionPlan.map((item, i) => `${String(i + 1).padStart(2, "0")}. ${item}`),
  ].join("\n");
}
