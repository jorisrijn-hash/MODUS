import type { ParsedDiagnostic } from "./types";

const FRICTION_TO_TAG: Record<string, string> = {
  Administration: "ADMINISTRATION",
  "Customer enquiries": "CUSTOMER INTAKE",
  "Sales follow-up": "CONVERSION",
  Bookings: "BOOKING",
  Reporting: "REPORTING",
  Data: "DATA",
  "Internal communication": "OPERATIONS",
  Scheduling: "BOOKING",
  Inventory: "OPERATIONS",
  "Invoices / finance": "ADMINISTRATION",
  "Customer support": "CUSTOMER INTAKE",
  Marketing: "WEBSITE",
  "Employee onboarding": "OPERATIONS",
  Software: "INTEGRATION",
  "Manual data entry": "AUTOMATION",
};

export function computeOpportunityTags(d: ParsedDiagnostic): string[] {
  const tags = new Set<string>();

  for (const friction of d.frictionAreas) {
    const tag = FRICTION_TO_TAG[friction];
    if (tag) tags.add(tag);
  }
  if (d.systems.includes("CRM")) tags.add("CRM");
  if (d.systems.some((s) => s === "AI Tools")) tags.add("AI");
  if (d.systemConnectivity === "Mostly manual" || d.systemConnectivity === "Some connections") {
    tags.add("INTEGRATION");
  }
  if (d.automationUsage.includes("No") || d.automationUsage.length === 0) {
    tags.add("AUTOMATION");
  }
  if (d.priorities.some((p) => p.toLowerCase().includes("revenue") || p.toLowerCase().includes("conversion"))) {
    tags.add("CONVERSION");
  }

  return Array.from(tags);
}
