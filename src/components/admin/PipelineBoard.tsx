"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Search } from "lucide-react";
import {
  STATUSES,
  type ParsedDiagnostic,
  type Status,
} from "@/lib/admin/types";
import { statusLabel } from "@/lib/admin/status";
import { REVIEW_STEPS } from "@/lib/admin/workspace";

export function PipelineBoard({
  diagnostics,
  totals,
}: {
  diagnostics: ParsedDiagnostic[];
  totals: Record<string, number>;
}) {
  const router = useRouter();
  const [records, setRecords] = useState(diagnostics);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<{ id: string; message: string } | null>(
    null,
  );
  const [announcement, setAnnouncement] = useState("");
  useEffect(() => setRecords(diagnostics), [diagnostics]);

  async function move(id: string, status: Status) {
    setBusy(id);
    setError(null);
    try {
      const response = await fetch(`/api/private/diagnostics/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok)
        throw new Error(
          "Not saved. Check your connection and admin access, then try again.",
        );
      const result = await response.json();
      setRecords((previous) =>
        previous.map((record) =>
          record.id === id
            ? { ...record, status: result.diagnostic.status }
            : record,
        ),
      );
      setAnnouncement(
        `Moved to ${statusLabel(result.diagnostic.status)}. Saved.`,
      );
      router.refresh();
    } catch (cause) {
      setError({
        id,
        message:
          cause instanceof Error
            ? cause.message
            : "Not saved. Please try again.",
      });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="workspace-eyebrow">Operations / Pipeline</p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight">
            Every next step, visible.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-graphite">
            Move a record after taking action. Changes save immediately and
            appear in its activity history. Moving a card does not contact the
            client.
          </p>
        </div>
        <Link
          href="/private/diagnostics"
          className="flex min-h-11 items-center gap-2 rounded-lg border border-line px-4 text-xs"
        >
          Open full inbox
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <label className="relative block max-w-sm">
        <span className="sr-only">Search loaded pipeline cards</span>
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted" />
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Search loaded cards…"
          className="h-11 w-full rounded-lg border border-line bg-surface pl-10 pr-3 text-sm"
        />
      </label>
      <p className="text-xs text-muted">
        Oldest 20 records per stage. Stage totals include all records; search
        filters the cards loaded here.
      </p>
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
      <div
        className="flex gap-4 overflow-x-auto pb-5"
        tabIndex={0}
        role="region"
        aria-label="Pipeline stages, scroll horizontally for more"
      >
        {STATUSES.map((status) => {
          const items = records.filter(
            (record) =>
              record.status === status &&
              `${record.companyName} ${record.email} ${record.primaryPainPoint}`
                .toLowerCase()
                .includes(q.toLowerCase()),
          );
          return (
            <section
              key={status}
              className="w-[280px] shrink-0 rounded-xl border border-line bg-mineral p-3"
              aria-label={`${statusLabel(status)} stage`}
            >
              <div className="flex items-center justify-between p-2">
                <h2 className="text-sm font-medium">{statusLabel(status)}</h2>
                <span className="rounded bg-surface px-2 py-1 text-xs text-muted">
                  {totals[status] ?? 0}
                </span>
              </div>
              <p className="min-h-16 px-2 py-2 text-xs leading-relaxed text-muted">
                {REVIEW_STEPS[status].meaning}
              </p>
              <div className="mt-2 space-y-3">
                {items.map((record) => (
                  <article
                    key={record.id}
                    className="rounded-lg border border-line bg-surface p-4"
                  >
                    <Link
                      href={`/private/diagnostics/${record.id}`}
                      className="text-sm font-medium hover:text-modus"
                    >
                      {record.companyName}
                    </Link>
                    <p className="mt-1 text-[11px] text-muted">
                      {record.industry}
                    </p>
                    <p className="mt-3 text-xs leading-relaxed text-graphite">
                      {record.primaryPainPoint}
                    </p>
                    <p className="mt-3 text-[10px] text-muted">
                      Submitted{" "}
                      {new Date(record.createdAt).toLocaleDateString("en-GB", {
                        timeZone: "UTC",
                      })}
                    </p>
                    <details className="mt-4 border-t border-line pt-3 text-xs">
                      <summary className="text-modus">
                        Suggested next step
                      </summary>
                      <p className="mt-2 leading-relaxed text-graphite">
                        {REVIEW_STEPS[status].next}
                      </p>
                    </details>
                    <label className="mt-4 block">
                      <span className="text-[10px] uppercase tracking-wider text-muted">
                        Move to stage
                      </span>
                      <select
                        aria-label={`Stage for ${record.companyName}`}
                        value={record.status}
                        disabled={busy !== null}
                        onChange={(event) =>
                          move(record.id, event.target.value as Status)
                        }
                        className="mt-2 min-h-10 w-full rounded-lg border border-line bg-paper px-2 text-xs disabled:opacity-50"
                      >
                        {STATUSES.map((value) => (
                          <option key={value} value={value}>
                            {statusLabel(value)}
                          </option>
                        ))}
                      </select>
                    </label>
                    {busy === record.id && (
                      <p className="mt-2 text-xs text-muted" role="status">
                        Saving…
                      </p>
                    )}
                    {error?.id === record.id && (
                      <p
                        className="mt-2 text-xs leading-relaxed text-danger"
                        role="alert"
                      >
                        {error.message}
                      </p>
                    )}
                  </article>
                ))}
              </div>
              {!items.length && (
                <p className="rounded-lg border border-dashed border-line p-4 text-xs text-muted">
                  {q
                    ? "No loaded cards match."
                    : "No loaded records in this stage."}
                </p>
              )}
              <Link
                href={`/private/diagnostics?status=${status}`}
                className="mt-3 block p-2 text-xs text-modus underline underline-offset-4"
              >
                View all {statusLabel(status).toLowerCase()} records
              </Link>
            </section>
          );
        })}
      </div>
    </div>
  );
}
