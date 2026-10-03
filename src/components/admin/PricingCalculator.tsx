"use client";

import { useState } from "react";
import { Copy, Link as LinkIcon } from "lucide-react";
import type { ParsedDiagnostic } from "@/lib/admin/types";
import { buildProposalText } from "@/lib/admin/proposalText";
import { recomputeForScopeOverride } from "@/lib/pricing/engine";
import { PRICING_CONFIG, type ImplementationScope, type PricingBandId } from "@/lib/pricing/config";

const SCOPE_OPTIONS: ImplementationScope[] = ["light", "standard", "substantial"];

export function PricingCalculator({
  diagnostic,
  onSave,
}: {
  diagnostic: ParsedDiagnostic;
  onSave: (patch: Record<string, number | string | boolean | null>) => Promise<void>;
}) {
  const [reviewedMin, setReviewedMin] = useState(
    diagnostic.reviewedEstimateMin?.toString() ?? diagnostic.calculatedEstimateMin?.toString() ?? ""
  );
  const [reviewedMax, setReviewedMax] = useState(
    diagnostic.reviewedEstimateMax?.toString() ?? diagnostic.calculatedEstimateMax?.toString() ?? ""
  );
  const [finalAmount, setFinalAmount] = useState(diagnostic.finalProposalAmount?.toString() ?? "");
  const [finalFee, setFinalFee] = useState(diagnostic.finalImplementationFee?.toString() ?? "");
  const [finalNote, setFinalNote] = useState(diagnostic.finalProposalNote ?? "");
  const [scopeOverride, setScopeOverride] = useState<ImplementationScope>(
    (diagnostic.implementationScope as ImplementationScope) ?? "light"
  );
  const [savedField, setSavedField] = useState<"reviewed" | "proposal" | null>(null);
  const [sending, setSending] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  async function save(field: "reviewed" | "proposal", patch: Record<string, number | string | null>) {
    await onSave(patch);
    setSavedField(field);
    window.setTimeout(() => setSavedField(null), 2000);
  }

  async function sendProposal() {
    setSending(true);
    try {
      await onSave({ sendProposal: true });
    } finally {
      setSending(false);
    }
  }

  function copy(value: string) {
    navigator.clipboard?.writeText(value);
  }

  function copyLink(value: string) {
    copy(value);
    setLinkCopied(true);
    window.setTimeout(() => setLinkCopied(false), 2000);
  }

  if (diagnostic.calculatedEstimateMin == null) {
    return <p className="text-[13.5px] text-muted">No pricing estimate on this submission.</p>;
  }

  const bandId = (diagnostic.pricingBand as PricingBandId) ?? "focused";
  const whatIf = recomputeForScopeOverride(bandId, scopeOverride);
  const scopeChanged = scopeOverride !== diagnostic.implementationScope;

  const officialAmount = finalAmount === "" ? null : Number(finalAmount);
  const officialFee = finalFee === "" ? null : Number(finalFee);
  const hasOfficialProposal = officialAmount != null || officialFee != null;

  return (
    <div className="space-y-4">
      {/* Backup info: the deterministic baseline, never re-run, always shown
          alongside any human override so the justification is never lost. */}
      <div className="flex flex-wrap items-baseline gap-3">
        <p className="text-2xl font-semibold text-ink">
          {diagnostic.manualScopeRequired
            ? `From €${diagnostic.calculatedEstimateMin.toLocaleString("en-GB")}`
            : `€${diagnostic.calculatedEstimateMin.toLocaleString("en-GB")} – €${diagnostic.calculatedEstimateMax?.toLocaleString("en-GB")}`}
        </p>
        <p className="text-[13px] text-muted">/ month (system-calculated)</p>
        {diagnostic.manualScopeRequired && (
          <span className="rounded-sm bg-signal/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-signal">
            Manual Scope
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <CalcField label="Band" value={diagnostic.pricingBand ?? "Unknown"} />
        <CalcField label="Complexity score" value={`${diagnostic.complexityScoreTotal ?? "?"} / 22`} />
        <CalcField label="Implementation scope" value={diagnostic.implementationScope ?? "Unknown"} />
        <CalcField label="Model version" value={diagnostic.pricingVersion ?? "Unknown"} />
      </div>

      {diagnostic.pricingFactors && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <CalcField label="Business scale" value={diagnostic.pricingFactors.businessScale} />
          <CalcField label="System fragmentation" value={diagnostic.pricingFactors.systemFragmentation} />
          <CalcField label="Operational complexity" value={diagnostic.pricingFactors.operationalComplexity} />
          <CalcField label="Implementation scope level" value={diagnostic.pricingFactors.implementationScope} />
        </div>
      )}

      {diagnostic.pricingReasoning.length > 0 && (
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.06em] text-muted">Why This Estimate</p>
          <ul className="mt-1.5 space-y-1">
            {diagnostic.pricingReasoning.map((reason) => (
              <li key={reason} className="text-[13px] text-graphite">
                • {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Live calculator: recomputes the band's range under a different
          implementation-scope assumption, using the exact same math as the
          real engine (recomputeForScopeOverride), not a rough guess. */}
      <div className="rounded-sm border border-line bg-mineral p-3">
        <p className="font-mono text-[9px] uppercase tracking-[0.06em] text-muted">
          Calculator — What If Scope Were Different?
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <select
            value={scopeOverride}
            onChange={(e) => setScopeOverride(e.target.value as ImplementationScope)}
            className="h-8 rounded border border-line bg-surface px-2 text-[12.5px] text-ink outline-none focus:border-modus"
          >
            {SCOPE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <p className="text-[13.5px] font-medium text-ink">
            {whatIf.manualScope
              ? `From €${whatIf.estimatedMin.toLocaleString("en-GB")}/month (manual scope)`
              : `€${whatIf.estimatedMin.toLocaleString("en-GB")} – €${whatIf.estimatedMax.toLocaleString("en-GB")}/month`}
          </p>
          {scopeChanged && (
            <button
              type="button"
              onClick={() => {
                setReviewedMin(String(whatIf.estimatedMin));
                setReviewedMax(String(whatIf.estimatedMax));
              }}
              className="ml-auto text-[12px] text-modus hover:text-modus-light"
            >
              Use as reviewed estimate
            </button>
          )}
        </div>
      </div>

      <div className="rounded-sm border border-line bg-surface p-3">
        <p className="font-mono text-[9px] uppercase tracking-[0.06em] text-muted">
          Reviewed Estimate (after MODUS validates)
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[13px] text-muted">€</span>
          <input
            type="number"
            value={reviewedMin}
            onChange={(e) => setReviewedMin(e.target.value)}
            className="h-8 w-24 rounded border border-line px-2 text-[13px] text-ink outline-none focus:border-modus"
          />
          <span className="text-[13px] text-muted">–</span>
          <span className="text-[13px] text-muted">€</span>
          <input
            type="number"
            value={reviewedMax}
            onChange={(e) => setReviewedMax(e.target.value)}
            className="h-8 w-24 rounded border border-line px-2 text-[13px] text-ink outline-none focus:border-modus"
          />
          <button
            type="button"
            onClick={() =>
              save("reviewed", {
                reviewedEstimateMin: reviewedMin === "" ? null : Number(reviewedMin),
                reviewedEstimateMax: reviewedMax === "" ? null : Number(reviewedMax),
              })
            }
            className="ml-auto rounded bg-ink px-3 py-1.5 text-[12px] font-medium text-paper hover:bg-graphite"
          >
            Save
          </button>
          {savedField === "reviewed" && <span className="text-[12px] text-modus">Saved.</span>}
        </div>
      </div>

      <div className="rounded-sm border border-line bg-surface p-3">
        <p className="font-mono text-[9px] uppercase tracking-[0.06em] text-muted">
          Final Proposal (agreed structure)
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-[13px] text-muted">€</span>
          <input
            type="number"
            value={finalAmount}
            onChange={(e) => setFinalAmount(e.target.value)}
            placeholder="Monthly amount"
            className="h-8 w-32 rounded border border-line px-2 text-[13px] text-ink outline-none focus:border-modus"
          />
          <span className="text-[13px] text-muted">/ month</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-[13px] text-muted">€</span>
          <input
            type="number"
            value={finalFee}
            onChange={(e) => setFinalFee(e.target.value)}
            placeholder="One-time implementation fee"
            className="h-8 w-40 rounded border border-line px-2 text-[13px] text-ink outline-none focus:border-modus"
          />
          <span className="text-[11.5px] text-muted">
            Indicative: €{PRICING_CONFIG.initialImplementation.indicativeMin.toLocaleString("en-GB")}–€
            {PRICING_CONFIG.initialImplementation.indicativeMax.toLocaleString("en-GB")}
          </span>
        </div>
        <textarea
          value={finalNote}
          onChange={(e) => setFinalNote(e.target.value)}
          placeholder="Notes on the agreed structure…"
          rows={2}
          className="mt-2 w-full resize-none rounded border border-line px-2 py-1.5 text-[13px] text-ink outline-none focus:border-modus"
        />
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              save("proposal", {
                finalProposalAmount: officialAmount,
                finalProposalNote: finalNote === "" ? null : finalNote,
                finalImplementationFee: officialFee,
              })
            }
            className="rounded bg-ink px-3 py-1.5 text-[12px] font-medium text-paper hover:bg-graphite"
          >
            Save
          </button>
          {savedField === "proposal" && <span className="text-[12px] text-modus">Saved.</span>}
        </div>
      </div>

      {hasOfficialProposal && (
        <div className="rounded-sm border border-modus/30 bg-modus/5 p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.06em] text-modus">Official Price Proposal</p>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-3">
            {officialAmount != null && (
              <p className="text-xl font-semibold text-ink">
                €{officialAmount.toLocaleString("en-GB")}
                <span className="text-[13px] font-normal text-muted"> / month</span>
              </p>
            )}
            {officialFee != null && (
              <p className="text-[14px] text-graphite">
                + €{officialFee.toLocaleString("en-GB")} one-time
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => copy(buildProposalText(diagnostic, officialAmount, officialFee, finalNote))}
            className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] text-graphite hover:text-ink"
          >
            <Copy className="h-3 w-3" strokeWidth={1.75} />
            Copy proposal with backup info
          </button>
        </div>
      )}

      {/* Turns the official figures above into an actual private, shareable
          page (/proposal/[token]) — same contextToken already used for
          GET /api/context/[token], never a second secret. officialAmount
          here reflects unsaved local state; the send guard below checks
          diagnostic.finalProposalAmount, the actually-persisted value, so
          this can't fire on an edit that was never saved. */}
      {diagnostic.finalProposalAmount != null && (
        <div className="rounded-sm border border-line bg-surface p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.06em] text-muted">Send Proposal</p>
          {!diagnostic.contextToken ? (
            <p className="mt-1.5 text-[12.5px] text-muted">
              No context token on this diagnostic (submitted before this feature existed) — a shareable link
              can&apos;t be generated.
            </p>
          ) : diagnostic.proposalSentAt ? (
            <>
              <p className="mt-1.5 text-[12.5px] text-graphite">
                Sent {new Date(diagnostic.proposalSentAt).toLocaleString("en-GB")}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => copyLink(`${window.location.origin}/proposal/${diagnostic.contextToken}`)}
                  className="inline-flex items-center gap-1.5 text-[12.5px] text-graphite hover:text-ink"
                >
                  <LinkIcon className="h-3 w-3" strokeWidth={1.75} />
                  {linkCopied ? "Copied." : "Copy Link"}
                </button>
                <button
                  type="button"
                  onClick={sendProposal}
                  disabled={sending}
                  className="text-[12.5px] text-graphite hover:text-ink disabled:opacity-50"
                >
                  {sending ? "Sending…" : "Resend (updates timestamp)"}
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={sendProposal}
              disabled={sending}
              className="mt-2 rounded bg-modus px-3 py-1.5 text-[12px] font-medium text-paper hover:bg-modus-light disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send Proposal"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function CalcField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-[0.06em] text-muted">{label}</p>
      <p className="mt-1 text-[13px] font-medium capitalize text-ink">{value}</p>
    </div>
  );
}
