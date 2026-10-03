import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { parseDiagnostic, STATUSES } from "@/lib/admin/types";
import { computeLeadFit } from "@/lib/admin/leadFit";
import { statusLabel } from "@/lib/admin/status";
import { REVIEW_STEPS, submissionHistory } from "@/lib/admin/workspace";

export default async function OverviewPage() {
  const now = new Date();
  const since = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 13),
  );
  const [total, byStatus, recentRaw, queueRaw, historyRaw] = await Promise.all([
    prisma.diagnostic.count(),
    prisma.diagnostic.groupBy({ by: ["status"], _count: true }),
    prisma.diagnostic.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.diagnostic.findMany({
      where: { status: { in: ["NEW", "REVIEWING"] } },
      orderBy: { createdAt: "asc" },
      take: 5,
    }),
    prisma.diagnostic.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
  ]);
  const counts = Object.fromEntries(byStatus.map((s) => [s.status, s._count]));
  const recent = recentRaw.map(parseDiagnostic);
  const queue = queueRaw.map(parseDiagnostic);
  const history = submissionHistory(
    historyRaw.map((d) => d.createdAt),
    now,
  );
  const peak = Math.max(1, ...history.map((d) => d.count));
  const needsAction = (counts.NEW ?? 0) + (counts.REVIEWING ?? 0);
  const signals = recent
    .flatMap((d) =>
      d.preliminarySignals
        .slice(0, 1)
        .map((signal) => ({ diagnostic: d, signal })),
    )
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="workspace-eyebrow">Operations / Overview</p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">
            The work, at a glance.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-graphite">
            A clear route from a submitted diagnostic to a considered next step.
          </p>
        </div>
        <Link
          href="/private/diagnostics"
          className="workspace-primary inline-flex min-h-11 items-center gap-3 rounded-lg px-4 text-xs font-medium"
        >
          Open inbox
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Metric
          label="Submitted"
          value={total}
          explanation="All saved diagnostics, across every status."
          href="/private/diagnostics"
        />
        <Metric
          label="Awaiting first review"
          value={counts.NEW ?? 0}
          explanation="Records still marked New. Start with the oldest."
          href="/private/diagnostics?status=NEW"
        />
        <Metric
          label="Active review queue"
          value={needsAction}
          explanation="New + In review. Contacted records are excluded."
          href="/private/pipeline"
        />
        <Metric
          label="Last 14 days"
          value={history.reduce((n, d) => n + d.count, 0)}
          explanation="Saved submissions in the UTC calendar window below."
          href={`/private/diagnostics?from=${history[0].date}`}
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)]">
        <section className="workspace-panel">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-medium">Submission activity</h2>
            <span className="text-[11px] text-muted">14 days · UTC</span>
          </div>
          <p className="mt-2 text-xs text-muted">
            Volume shows intake, not business performance.
          </p>
          <div className="mt-7 flex h-32 items-end gap-1.5" aria-hidden="true">
            {history.map((d) => (
              <div
                key={d.date}
                className="flex h-full min-w-0 flex-1 items-end"
              >
                <div
                  title={`${d.date}: ${d.count}`}
                  className={`w-full rounded-t-sm ${d.count ? "bg-modus/65" : "bg-line"}`}
                  style={{
                    height: d.count ? `${(d.count / peak) * 100}%` : "2px",
                  }}
                />
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between text-[10px] text-muted">
            <span>{history[0].date}</span>
            <span>{history[13].date}</span>
          </div>
          <details className="mt-5 border-t border-line pt-4 text-xs text-graphite">
            <summary>View daily counts</summary>
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
              {history.map((d) => (
                <div key={d.date}>
                  <dt className="text-muted">{d.date}</dt>
                  <dd>{d.count} submissions</dd>
                </div>
              ))}
            </dl>
          </details>
        </section>
        <section className="workspace-panel">
          <p className="workspace-eyebrow">Next actions</p>
          <h2 className="mt-2 text-lg">Start with the oldest open record.</h2>
          {queue.length === 0 ? (
            <p className="mt-5 text-sm text-muted">
              {total
                ? "The review queue is clear. Follow-ups remain visible in Pipeline."
                : "No submissions yet. The first saved diagnostic will appear here."}
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {queue.map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/private/diagnostics/${d.id}`}
                    className="group flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm">{d.companyName}</p>
                      <p className="mt-1 text-xs text-muted">
                        {statusLabel(d.status)} ·{" "}
                        {new Date(d.createdAt).toLocaleDateString("en-GB", {
                          timeZone: "UTC",
                        })}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted group-hover:text-modus" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)]">
        <section className="workspace-panel">
          <h2 className="text-sm font-medium">Signals worth investigating</h2>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            From the six most recent diagnostics. These are prompts from
            self-reported answers; validate them with the business.
          </p>
          {signals.length === 0 && (
            <p className="mt-6 text-sm text-muted">
              No preliminary signals in the recent submissions. Read the answers
              directly before drawing conclusions.
            </p>
          )}
          <div className="mt-5 space-y-3">
            {signals.map(({ diagnostic: d, signal: s }) => (
              <details
                key={`${d.id}-${s.id}`}
                className="rounded-lg border border-line bg-paper p-4"
              >
                <summary className="text-sm font-medium">
                  <span className="mb-1 block text-[10px] font-normal uppercase tracking-wider text-modus">
                    {d.companyName} / Preliminary
                  </span>
                  {s.headline}
                </summary>
                <div className="mt-4 space-y-3 text-xs leading-relaxed text-graphite">
                  <p>{s.body}</p>
                  <p>
                    <strong className="text-ink">Why it matters: </strong>
                    {s.why}
                  </p>
                  <p className="text-ink">What to validate</p>
                  <ul className="list-inside list-disc space-y-1">
                    {s.inspect.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p>
                    <strong className="text-ink">Possible next step: </strong>
                    {s.intervention}
                  </p>
                  <Link
                    href={`/private/diagnostics/${d.id}`}
                    className="inline-block py-2 text-modus underline underline-offset-4"
                  >
                    Review source answers
                  </Link>
                </div>
              </details>
            ))}
          </div>
        </section>
        <section className="workspace-panel">
          <h2 className="text-sm font-medium">Workflow distribution</h2>
          <p className="mt-2 text-xs text-muted">
            Current recorded stages, not a conversion funnel.
          </p>
          <div className="mt-5 space-y-4">
            {STATUSES.map((status) => (
              <div key={status}>
                <Link
                  href={`/private/diagnostics?status=${status}`}
                  className="flex justify-between text-xs"
                >
                  <span>{statusLabel(status)}</span>
                  <span className="text-graphite">{counts[status] ?? 0}</span>
                </Link>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full bg-modus/70"
                    style={{
                      width: `${total ? ((counts[status] ?? 0) / total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <details className="mt-6 border-t border-line pt-4 text-xs">
            <summary>What does a stage mean?</summary>
            <dl className="mt-4 space-y-3">
              {STATUSES.map((status) => (
                <div key={status}>
                  <dt className="text-ink">{statusLabel(status)}</dt>
                  <dd className="mt-1 leading-relaxed text-muted">
                    {REVIEW_STEPS[status].meaning}
                  </dd>
                </div>
              ))}
            </dl>
          </details>
        </section>
      </div>
      <section className="workspace-panel">
        <h2 className="text-sm font-medium">Recent diagnostics</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {recent.map((d) => (
            <Link
              key={d.id}
              href={`/private/diagnostics/${d.id}`}
              className="rounded-lg border border-line bg-paper p-4 hover:border-line-strong"
            >
              <div className="flex justify-between gap-3">
                <span className="text-sm font-medium">{d.companyName}</span>
                <span className="shrink-0 text-[10px] text-modus">
                  {statusLabel(d.status)}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted">
                {d.industry} · {d.employees} employees
              </p>
              <p className="mt-3 text-xs text-graphite">{d.primaryPainPoint}</p>
              <p className="mt-3 text-[10px] text-muted">
                {computeLeadFit(d).level.toLowerCase()} rule-based fit ·
                validate in review
              </p>
            </Link>
          ))}
        </div>
        {!recent.length && (
          <p className="mt-4 text-sm text-muted">No saved diagnostics yet.</p>
        )}
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  explanation,
  href,
}: {
  label: string;
  value: number;
  explanation: string;
  href: string;
}) {
  return (
    <div className="workspace-panel">
      <Link href={href} className="block">
        <p className="workspace-eyebrow">{label}</p>
        <p className="mt-4 text-4xl font-medium tracking-tight">{value}</p>
      </Link>
      <p className="mt-3 text-xs leading-relaxed text-muted">{explanation}</p>
    </div>
  );
}
