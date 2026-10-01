import Link from "next/link";
import { prisma } from "@/lib/db";
import { parseDiagnostic } from "@/lib/admin/types";
import { computeLeadFit } from "@/lib/admin/leadFit";
import { daysAgo } from "@/lib/admin/dates";
import { EmptyState } from "@/components/admin/EmptyState";

export default async function OverviewPage() {
  const sevenDaysAgo = daysAgo(7);

  const [total, byStatus, last7Days, recentRaw, needsAttentionRaw] = await Promise.all([
    prisma.diagnostic.count(),
    prisma.diagnostic.groupBy({ by: ["status"], _count: true }),
    prisma.diagnostic.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.diagnostic.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.diagnostic.findMany({ where: { status: "NEW" }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const statusCounts = Object.fromEntries(byStatus.map((s) => [s.status, s._count])) as Record<
    string,
    number
  >;
  const recent = recentRaw.map(parseDiagnostic);
  const needsAttention = needsAttentionRaw.map(parseDiagnostic);
  const needsAction = (statusCounts.NEW ?? 0) + (statusCounts.REVIEWING ?? 0);

  if (total === 0) {
    return (
      <EmptyState
        id="OVERVIEW / 000"
        title="No diagnostics yet."
        body="New submissions will appear here when someone completes the MODUS Diagnostic."
        actionLabel="View Public Diagnostic"
        actionHref="/diagnostic"
      />
    );
  }

  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
        MODUS / Overview
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-ink">What needs attention?</h1>

      <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-4">
        <Metric label="Total" value={total} />
        <Metric label="New" value={statusCounts.NEW ?? 0} />
        <Metric label="Needs Action" value={needsAction} />
        <Metric label="Last 7 Days" value={last7Days} />
      </div>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
            Needs Attention
          </p>
          <div className="mt-3 divide-y divide-line border-t border-line">
            {needsAttention.length === 0 && (
              <p className="py-4 text-[13px] text-muted">Nothing needs attention right now.</p>
            )}
            {needsAttention.map((d) => {
              const fit = computeLeadFit(d);
              return (
                <Link
                  key={d.id}
                  href={`/private/diagnostics/${d.id}`}
                  className="flex items-center justify-between gap-4 py-3.5 hover:bg-white"
                >
                  <div>
                    <p className="text-[13.5px] font-medium text-ink">{d.companyName}</p>
                    <p className="text-[12px] text-muted">
                      {d.primaryPainPoint} · {new Date(d.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 font-mono text-[10px] uppercase ${
                      fit.level === "HIGH" ? "text-signal" : "text-modus"
                    }`}
                  >
                    {fit.level} FIT
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
            Recent Diagnostics
          </p>
          <div className="mt-3 divide-y divide-line border-t border-line">
            {recent.map((d) => (
              <Link
                key={d.id}
                href={`/private/diagnostics/${d.id}`}
                className="flex items-center justify-between gap-4 py-3.5 hover:bg-white"
              >
                <div>
                  <p className="text-[13.5px] font-medium text-ink">{d.companyName}</p>
                  <p className="text-[12px] text-muted">
                    {d.industry} · {d.employees} employees
                  </p>
                </div>
                <span className="shrink-0 font-mono text-[10px] uppercase text-muted">
                  {d.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white p-5">
      <p className="text-2xl font-semibold text-ink">{value}</p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.06em] text-muted">{label}</p>
    </div>
  );
}
