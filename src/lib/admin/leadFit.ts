import type { ParsedDiagnostic } from "./types";

export type LeadFit = { level: "HIGH" | "MEDIUM" | "LOW"; reasons: string[] };

const HIGH_ADMIN = ["10–25 hours", "25+ hours"];
const LARGE_TEAM = ["21–50", "51–100", "101–250", "250+"];
const NEAR_TERM = ["Immediately", "Within 30 days"];

export function computeLeadFit(d: ParsedDiagnostic): LeadFit {
  const reasons: string[] = [];
  let score = 0;

  if (d.systems.length >= 3 && d.systemConnectivity !== "Mostly connected") {
    score += 1;
    reasons.push(`${d.systems.length} systems with limited connection`);
  }
  if (HIGH_ADMIN.includes(d.adminWorkload)) {
    score += 1;
    reasons.push(`${d.adminWorkload} of repetitive admin work per week`);
  }
  if (d.frictionAreas.length >= 2) {
    score += 1;
    reasons.push(`${d.frictionAreas.length} operational friction areas flagged`);
  }
  if (LARGE_TEAM.includes(d.employees)) {
    score += 1;
    reasons.push(`${d.employees} employees, enough complexity to matter`);
  }
  if (NEAR_TERM.includes(d.timing)) {
    score += 1;
    reasons.push(`Wants to start ${d.timing.toLowerCase()}`);
  }
  if (d.priorities.length > 0) {
    reasons.push(`Clear priority: ${d.priorities[0]}`);
  }

  const level: LeadFit["level"] = score >= 3 ? "HIGH" : score >= 1 ? "MEDIUM" : "LOW";
  return { level, reasons };
}
