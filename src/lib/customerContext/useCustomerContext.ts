"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { loadDiagnosticState } from "@/lib/diagnostic/storage";
import { getContextReference, listenContextReferenceChange } from "./storage";
import { nextBestAction } from "./nextBestAction";
import type { CustomerContextSummary, LifecycleState, NextBestAction } from "./types";

// Both localStorage (context reference) and sessionStorage (in-progress
// Diagnostic draft) are browser-only — SSR always sees "nothing there".
// useSyncExternalStore is what today's Loader bug taught us to use for
// exactly this shape of problem: a plain useState+effect version computes
// the real value once mounted, but does so a tick after the initial
// client render, and that mismatch between the server-assumed render and
// the client's later-corrected one can leave stale markup on screen
// instead of the corrected value. useSyncExternalStore's server-snapshot
// argument makes the "nothing yet" state explicit and handled correctly.
function subscribeNever() {
  return () => {};
}

// The context reference can change from elsewhere on the page (submitting
// the Diagnostic, clicking "start a new diagnostic") while this hook is
// already mounted, so it needs a real subscription — the draft-diagnostic
// checks below don't, since nothing outside the Diagnostic page itself
// writes to that storage while this hook is mounted elsewhere.
function subscribeToContextReference(callback: () => void) {
  return listenContextReferenceChange(callback);
}

function getLocalCompanyName() {
  return getContextReference()?.companyName ?? null;
}

function getHasContextToken() {
  return !!getContextReference()?.contextToken;
}

function getHasDiagnosticDraft() {
  const saved = loadDiagnosticState();
  return !!(saved && (saved.answers.companyName || saved.step > 0));
}

export type CustomerContext = {
  lifecycleState: LifecycleState;
  companyName: string | null;
  nextBestAction: NextBestAction;
  summary: CustomerContextSummary | null;
  summaryStatus: "idle" | "loading" | "ready" | "error";
};

export function useCustomerContext(): CustomerContext {
  const hasContextToken = useSyncExternalStore(subscribeToContextReference, getHasContextToken, () => false);
  const hasDiagnosticDraft = useSyncExternalStore(subscribeNever, getHasDiagnosticDraft, () => false);
  const localCompanyName = useSyncExternalStore(subscribeToContextReference, getLocalCompanyName, () => null);

  const [summary, setSummary] = useState<CustomerContextSummary | null>(null);
  // Only ever set from the fetch's own callbacks below (a legitimate
  // "subscribe to an external system" effect) — "loading" is never assigned
  // directly, it's the implicit default while this is still null and a
  // token exists, so the effect never calls setState synchronously in its
  // own body.
  const [fetchOutcome, setFetchOutcome] = useState<"ready" | "error" | null>(null);

  useEffect(() => {
    if (!hasContextToken) return;
    const ref = getContextReference();
    if (!ref) return;

    let cancelled = false;
    fetch(`/api/context/${ref.contextToken}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: CustomerContextSummary) => {
        if (!cancelled) {
          setSummary(data);
          setFetchOutcome("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setFetchOutcome("error");
      });
    return () => {
      cancelled = true;
    };
  }, [hasContextToken]);

  const summaryStatus: CustomerContext["summaryStatus"] = !hasContextToken
    ? "idle"
    : (fetchOutcome ?? "loading");

  const lifecycleState: LifecycleState = hasContextToken
    ? summary?.proposalUrl
      ? "PROPOSAL_READY"
      : "PROFILE_READY"
    : hasDiagnosticDraft
      ? "DIAGNOSTIC_STARTED"
      : "ANONYMOUS";

  // Optimistic company name from the local reference (trusted, since it's
  // literally what the visitor themselves typed in), refined once the
  // server summary confirms it — avoids a flash of "no company" before
  // the fetch resolves.
  const companyName = summary?.companyName ?? localCompanyName;

  return {
    lifecycleState,
    companyName,
    nextBestAction: nextBestAction(lifecycleState, summary?.proposalUrl),
    summary,
    summaryStatus,
  };
}
