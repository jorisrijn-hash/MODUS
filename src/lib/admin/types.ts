import type { Diagnostic, Note, ActivityEvent } from "@prisma/client";
import type { QualitativeLevel } from "@/lib/pricing/types";

export type PricingFactors = {
  businessScale: QualitativeLevel;
  systemFragmentation: QualitativeLevel;
  operationalComplexity: QualitativeLevel;
  implementationScope: QualitativeLevel;
};

export type ParsedDiagnostic = Omit<
  Diagnostic,
  | "customerChannels"
  | "enquiryHandling"
  | "systems"
  | "automationUsage"
  | "frictionAreas"
  | "impactAreas"
  | "priorities"
  | "preliminaryProfile"
  | "preliminarySignals"
  | "pricingReasoning"
  | "pricingFactors"
> & {
  customerChannels: string[];
  enquiryHandling: string[];
  systems: string[];
  automationUsage: string[];
  frictionAreas: string[];
  impactAreas: string[];
  priorities: string[];
  preliminaryProfile: { label: string; value: string; tone: string }[];
  preliminarySignals: {
    id: string;
    headline: string;
    body: string;
    why: string;
    inspect: string[];
    intervention: string;
  }[];
  pricingReasoning: string[];
  pricingFactors: PricingFactors | null;
};

function safeParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function parseDiagnostic(d: Diagnostic): ParsedDiagnostic {
  return {
    ...d,
    customerChannels: safeParse(d.customerChannels, []),
    enquiryHandling: safeParse(d.enquiryHandling, []),
    systems: safeParse(d.systems, []),
    automationUsage: safeParse(d.automationUsage, []),
    frictionAreas: safeParse(d.frictionAreas, []),
    impactAreas: safeParse(d.impactAreas, []),
    priorities: safeParse(d.priorities, []),
    preliminaryProfile: safeParse(d.preliminaryProfile, []),
    preliminarySignals: safeParse(d.preliminarySignals, []),
    pricingReasoning: safeParse(d.pricingReasoning ?? "[]", []),
    pricingFactors: d.pricingFactors ? safeParse<PricingFactors | null>(d.pricingFactors, null) : null,
  };
}

export type { Note, ActivityEvent };

export const STATUSES = [
  "NEW",
  "REVIEWING",
  "REVIEWED",
  "CONTACTED",
  "QUALIFIED",
  "CONVERTED",
  "CLOSED",
] as const;
export type Status = (typeof STATUSES)[number];
