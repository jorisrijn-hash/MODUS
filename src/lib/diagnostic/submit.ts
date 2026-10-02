import type { DiagnosticAnswers, ProfileIndicator, Signal } from "./types";

function getUtmAndSource() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source") ?? "",
    utmMedium: params.get("utm_medium") ?? "",
    utmCampaign: params.get("utm_campaign") ?? "",
    referrer: document.referrer || "",
    source: params.get("utm_source") ? "" : document.referrer ? "Referral" : "Direct",
  };
}

/**
 * One idempotency key per submission ATTEMPT-SET, held for the life of the
 * page.
 *
 * It is generated once and reused across retries on purpose: that is what
 * makes a retry after a timed-out response resolve to the original record
 * instead of creating a second lead. Regenerating it per call would defeat
 * the whole mechanism.
 */
let idempotencyKey: string | null = null;

function submissionKey(): string {
  if (!idempotencyKey) {
    idempotencyKey =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `k_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
  return idempotencyKey;
}

export async function submitDiagnostic(
  answers: DiagnosticAnswers,
  preliminaryProfile: ProfileIndicator[],
  preliminarySignals: Signal[]
): Promise<{ ok: boolean; id?: string; contextToken?: string }> {
  try {
    const res = await fetch("/api/diagnostic", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": submissionKey() },
      body: JSON.stringify({
        ...answers,
        preliminaryProfile,
        preliminarySignals,
        ...getUtmAndSource(),
      }),
    });
    if (!res.ok) return { ok: false };
    const data = await res.json();
    return { ok: true, id: data.id, contextToken: data.contextToken };
  } catch {
    return { ok: false };
  }
}
