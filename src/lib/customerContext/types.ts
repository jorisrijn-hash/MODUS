import type { QualitativeLevel } from "@/lib/pricing/types";

/**
 * Only the states this app can actually produce today are modeled as real
 * values. PROPOSAL_READY was added once /proposal/[token] and the admin
 * "Send Proposal" action actually existed — not before. The rest of the
 * future set (REVIEW_BOOKED, CLIENT, ...) still isn't included, per the
 * same rule: claiming a state would mean the UI implying MODUS did
 * something it didn't. Add them here when the feature behind them exists.
 */
export type LifecycleState = "ANONYMOUS" | "DIAGNOSTIC_STARTED" | "PROFILE_READY" | "PROPOSAL_READY";

export type NextBestActionId = "RUN_DIAGNOSTIC" | "CONTINUE_DIAGNOSTIC" | "VIEW_PROFILE" | "VIEW_PROPOSAL";

export type NextBestAction = {
  id: NextBestActionId;
  href: string;
};

/** What's saved in localStorage: just a safe reference, never the business
 * facts themselves (see storage.ts). */
export type ContextReference = {
  contextToken: string;
  companyName: string;
  savedAt: number;
};

/** The public, lightweight summary GET /api/context/[token] returns.
 * Deliberately excludes raw free-text answers, internal pricing reasoning,
 * admin notes, and anything from src/lib/admin — this is customer-facing
 * data about the customer's own submission, not an admin export. */
export type CustomerContextSummary = {
  companyName: string;
  submittedAt: string;
  signalsCount: number;
  // Non-null only once an admin has explicitly used "Send Proposal" —
  // never derived from finalProposalAmount alone, so a draft figure never
  // becomes visible here before someone deliberately sends it.
  proposalUrl: string | null;
  estimate: {
    min: number;
    max: number;
    manualScope: boolean;
    band: string;
    factors: {
      businessScale: QualitativeLevel;
      systemFragmentation: QualitativeLevel;
      operationalComplexity: QualitativeLevel;
      implementationScope: QualitativeLevel;
    };
  } | null;
};
