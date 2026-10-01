"use client";

import { useMemo, useState } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { PageHeader } from "@/components/app/ui/PageHeader";
import { StatusBadge } from "@/components/app/ui/StatusBadge";
import { Drawer } from "@/components/app/ui/Drawer";
import { LEADS, type Lead, type LeadStatus } from "@/lib/appDemo/data";

const STATUS_TONE: Record<LeadStatus, "neutral" | "positive" | "warning" | "info"> = {
  new: "info",
  contacted: "neutral",
  qualified: "positive",
  won: "positive",
  lost: "warning",
};

const STATUSES: (LeadStatus | "all")[] = ["all", "new", "contacted", "qualified", "won", "lost"];
const PAGE_SIZE = 8;

type SortKey = "date" | "value";

export default function LeadsPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<Lead | null>(null);

  const filtered = useMemo(() => {
    let rows = LEADS;
    if (statusFilter !== "all") rows = rows.filter((l) => l.status === statusFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter((l) => l.name.toLowerCase().includes(q) || l.company?.toLowerCase().includes(q));
    }
    rows = [...rows].sort((a, b) => (sortKey === "value" ? b.value - a.value : LEADS.indexOf(a) - LEADS.indexOf(b)));
    return rows;
  }, [query, statusFilter, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function updateQuery(v: string) {
    setQuery(v);
    setPage(1);
  }

  function updateStatus(v: LeadStatus | "all") {
    setStatusFilter(v);
    setPage(1);
  }

  return (
    <div>
      <PageHeader title="Leads" subtitle={`${LEADS.length} leads tracked this month.`} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" strokeWidth={1.75} />
          <input
            type="text"
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            placeholder="Search leads…"
            className="w-full rounded-md border border-line bg-paper py-2 pl-9 pr-3 text-[13px] text-ink outline-none placeholder:text-muted focus:border-ink/30"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => updateStatus(s)}
              className={`rounded-md border px-2.5 py-1.5 text-[12px] font-medium capitalize transition-colors ${
                statusFilter === s ? "border-ink bg-ink text-paper" : "border-line text-graphite hover:border-ink/30"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-paper">
        <table className="w-full min-w-[600px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-[0.05em] text-muted">
              <th className="px-4 py-3 font-medium">Lead</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">
                <button type="button" onClick={() => setSortKey("value")} className="flex items-center gap-1 hover:text-graphite">
                  Potential value <ArrowUpDown className="h-3 w-3" strokeWidth={1.75} />
                </button>
              </th>
              <th className="px-4 py-3 font-medium">
                <button type="button" onClick={() => setSortKey("date")} className="flex items-center gap-1 hover:text-graphite">
                  Date <ArrowUpDown className="h-3 w-3" strokeWidth={1.75} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => setActive(lead)}
                className="cursor-pointer border-b border-line last:border-b-0 transition-colors hover:bg-surface/60"
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{lead.name}</p>
                  {lead.company && <p className="text-[11.5px] text-muted">{lead.company}</p>}
                </td>
                <td className="px-4 py-3 text-graphite">{lead.source}</td>
                <td className="px-4 py-3">
                  <StatusBadge tone={STATUS_TONE[lead.status]}>{lead.status}</StatusBadge>
                </td>
                <td className="px-4 py-3 text-graphite">€{lead.value.toLocaleString("nl-NL")}</td>
                <td className="px-4 py-3 text-muted">{lead.date}</td>
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  No leads match this search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-[12.5px] text-muted">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-md border border-line px-3 py-1.5 font-medium text-graphite transition-colors hover:border-ink/30 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md border border-line px-3 py-1.5 font-medium text-graphite transition-colors hover:border-ink/30 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      <Drawer open={!!active} onOpenChange={(open) => !open && setActive(null)} title={active?.name ?? ""}>
        {active && (
          <div className="space-y-4">
            {active.company && <p className="text-[13.5px] text-graphite">{active.company}</p>}
            <StatusBadge tone={STATUS_TONE[active.status]}>{active.status}</StatusBadge>
            <div className="space-y-2 rounded-md border border-line bg-mineral p-4">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-muted">Source</span>
                <span className="font-medium text-ink">{active.source}</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-muted">Potential value</span>
                <span className="font-medium text-ink">€{active.value.toLocaleString("nl-NL")}</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-muted">Date</span>
                <span className="font-medium text-ink">{active.date}</span>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
