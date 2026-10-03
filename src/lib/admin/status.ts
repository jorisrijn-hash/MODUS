import { STATUSES } from "@/lib/admin/types";

/**
 * The workflow the admin actually moves a diagnostic through:
 * New → In review → Contacted → Closed.
 *
 * The stored vocabulary is wider than those four and is deliberately NOT
 * migrated. Production already holds `QUALIFIED`, and a record that was
 * marked qualified by a person should not be silently rewritten into one
 * of four buckets to make a redesign tidy. So:
 *
 *  - these four are offered as the workflow;
 *  - any other stored value is still displayed, with its own label, and
 *    is still filterable;
 *  - nothing rewrites existing rows.
 */
export const WORKFLOW_STATUSES = ["NEW", "REVIEWING", "CONTACTED", "CLOSED"] as const;

export const STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  REVIEWING: "In review",
  REVIEWED: "Reviewed",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  CONVERTED: "Converted",
  CLOSED: "Closed",
};

export function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

/** Every value the filter can offer, workflow first. */
export const ALL_STATUSES = STATUSES;
