import type { DiagnosticAnswers, ProfileIndicator, Signal } from "./types";

export function buildEmailSummary(
  answers: DiagnosticAnswers,
  indicators: ProfileIndicator[],
  signals: Signal[]
): string {
  const lines = [
    `Company: ${answers.companyName}`,
    answers.website && `Website: ${answers.website}`,
    `Industry: ${answers.industry === "Other" ? answers.industryOther : answers.industry}`,
    `Employees: ${answers.employees} · Locations: ${answers.locations}`,
    "",
    `Systems: ${answers.systems.join(", ") || "none specified"}`,
    `Connection level: ${answers.connectionLevel}`,
    `Spreadsheet dependency: ${answers.spreadsheetDependency}`,
    "",
    `Primary friction: ${answers.primaryPain || answers.friction[0] || "not specified"}`,
    answers.problemDescription && `Problem described: ${answers.problemDescription}`,
    `Frequency: ${answers.frequency} · Impact: ${answers.impact.join(", ")}`,
    "",
    `Priorities: ${answers.priorities.join(", ")}`,
    `Timing: ${answers.timing}`,
    "",
    "--- Initial Indication ---",
    ...indicators.map((i) => `${i.label}: ${i.value}`),
    "",
    signals.length > 0 ? "--- Preliminary Signals ---" : "",
    ...signals.map((s) => `• ${s.headline}`),
    "",
    `Contact: ${answers.firstName} ${answers.lastName} <${answers.email}>${answers.phone ? ` · ${answers.phone}` : ""}`,
    answers.role && `Role: ${answers.role === "Other" ? answers.roleOther : answers.role}`,
  ].filter(Boolean);

  return lines.join("\n");
}
