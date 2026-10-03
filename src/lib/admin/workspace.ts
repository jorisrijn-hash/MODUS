import type { Status } from "./types";

export const REVIEW_STEPS: Record<Status, { meaning: string; next: string }> = {
  NEW: {
    meaning: "Submitted, awaiting a first read.",
    next: "Read the answers and identify a question to validate.",
  },
  REVIEWING: {
    meaning: "A human review is in progress.",
    next: "Validate the signals and record evidence in a note.",
  },
  REVIEWED: {
    meaning: "The initial review is complete.",
    next: "Decide whether to follow up and record why.",
  },
  CONTACTED: {
    meaning: "Contact has been made.",
    next: "Record the response and agree a next step.",
  },
  QUALIFIED: {
    meaning: "Marked as a relevant opportunity by a reviewer.",
    next: "Confirm scope and assumptions before preparing a proposal.",
  },
  CONVERTED: {
    meaning: "Marked as converted by a reviewer.",
    next: "Record the handover and delivery expectations.",
  },
  CLOSED: {
    meaning: "No further action is currently planned.",
    next: "Keep a note of the decision so the history is understandable.",
  },
};

/** UTC calendar buckets; no fabricated points or interpolation. */
export function submissionHistory(
  dates: (Date | string)[],
  now = new Date(),
  days = 14,
) {
  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const buckets = Array.from({ length: days }, (_, i) => ({
    date: new Date(today - (days - 1 - i) * 86400000)
      .toISOString()
      .slice(0, 10),
    count: 0,
  }));
  const index = new Map(buckets.map((bucket) => [bucket.date, bucket]));
  for (const raw of dates) {
    const date = new Date(raw);
    if (!Number.isNaN(date.getTime())) {
      const bucket = index.get(date.toISOString().slice(0, 10));
      if (bucket) bucket.count++;
    }
  }
  return buckets;
}
