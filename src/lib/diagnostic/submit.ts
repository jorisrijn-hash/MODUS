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

export async function submitDiagnostic(
  answers: DiagnosticAnswers,
  preliminaryProfile: ProfileIndicator[],
  preliminarySignals: Signal[]
): Promise<{ ok: boolean; id?: string; contextToken?: string }> {
  try {
    const res = await fetch("/api/diagnostic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
