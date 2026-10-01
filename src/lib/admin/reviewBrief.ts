import type { ParsedDiagnostic } from "./types";

export type ReviewBrief = {
  context: string[];
  whatWeKnow: string[];
  signals: string[];
  questionsToValidate: string[];
  areasToInspect: string[];
  interventionCategories: string[];
  callAgenda: string[];
};

/**
 * Deterministic, rule-based brief assembled from the submitted answers —
 * not an AI analysis. Framed as a starting point for a human review call,
 * not a conclusion.
 */
export function buildReviewBrief(d: ParsedDiagnostic): ReviewBrief {
  const context = [
    `${d.industry} business`,
    `${d.employees} employees, ${d.locations} location(s)`,
    `${d.systems.length} operational systems identified`,
  ];

  const whatWeKnow = [
    `Customers reach them via: ${d.customerChannels.join(", ") || "not specified"}`,
    `Enquiries handled via: ${d.enquiryHandling.join(", ") || "not specified"}`,
    `Systems connectivity: ${d.systemConnectivity}`,
    `Primary friction: ${d.primaryPainPoint}`,
    `In their words: "${d.problemDescription}"`,
  ];

  const signals = d.preliminarySignals.map((s) => s.headline);
  if (signals.length === 0) signals.push("No strong rule-based signal. Inspect manually during the call.");

  const questionsToValidate = [
    `How many ${d.primaryPainPoint.toLowerCase() || "enquiries"} arrive each week?`,
    "Who currently owns follow-up, day to day?",
    "How often does work get missed or duplicated?",
    d.systems.length > 1 ? "Does the primary system contain all relevant records, or do things live in multiple places?" : null,
    "How long does response/turnaround typically take today?",
  ].filter((q): q is string => Boolean(q));

  const areasToInspect = Array.from(
    new Set([d.primaryPainPoint, ...d.frictionAreas.slice(0, 3)].filter(Boolean))
  );

  const interventionCategories = Array.from(
    new Set(
      [
        d.systemConnectivity !== "Mostly connected" ? "Systems integration" : null,
        ["10–25 hours", "25+ hours"].includes(d.adminWorkload) ? "Automation" : null,
        "Process redesign",
      ].filter((c): c is string => Boolean(c))
    )
  );

  const callAgenda = [
    "Understand current workflow, step by step",
    "Validate the preliminary Signals against reality",
    "Quantify the impact (time, revenue, or both)",
    "Identify the single highest-priority constraint",
    "Agree the next step",
  ];

  return { context, whatWeKnow, signals, questionsToValidate, areasToInspect, interventionCategories, callAgenda };
}

export function reviewBriefToText(brief: ReviewBrief, companyName: string): string {
  const section = (title: string, items: string[]) =>
    `${title.toUpperCase()}\n${items.map((i) => `- ${i}`).join("\n")}`;

  return [
    `MODUS Review Brief for ${companyName}`,
    "",
    section("Context", brief.context),
    "",
    section("What We Know", brief.whatWeKnow),
    "",
    section("Signals", brief.signals),
    "",
    section("Questions To Validate", brief.questionsToValidate),
    "",
    section("Areas To Inspect", brief.areasToInspect),
    "",
    section("Possible Intervention Categories", brief.interventionCategories),
    "",
    section("Call Agenda", brief.callAgenda),
  ].join("\n");
}
