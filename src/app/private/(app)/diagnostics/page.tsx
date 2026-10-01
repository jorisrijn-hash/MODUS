"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Search } from "lucide-react";
import { EmptyState } from "@/components/admin/EmptyState";
import { STATUSES, type ParsedDiagnostic } from "@/lib/admin/types";

const employeeOptions = ["ALL", "1–5", "6–20", "21–50", "51–100", "101–250", "250+"];

export default function DiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState<ParsedDiagnostic[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");
  const [employees, setEmployees] = useState("ALL");

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status !== "ALL") params.set("status", status);
    if (employees !== "ALL") params.set("employees", employees);

    const t = window.setTimeout(() => {
      setLoading(true);
      fetch(`/api/private/diagnostics?${params.toString()}`)
        .then((r) => r.json())
        .then((data) => setDiagnostics(data.diagnostics ?? []))
        .finally(() => setLoading(false));
    }, 250);
    return () => window.clearTimeout(t);
  }, [q, status, employees]);

  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
        MODUS / Diagnostics
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-ink">Submitted diagnostics.</h1>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search company, contact, email, website…"
            className="h-10 w-full rounded border border-line bg-white pl-9 pr-3 text-[13.5px] text-ink outline-none focus:border-modus"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 rounded border border-line bg-white px-3 text-[13px] text-graphite outline-none"
        >
          <option value="ALL">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={employees}
          onChange={(e) => setEmployees(e.target.value)}
          className="h-10 rounded border border-line bg-white px-3 text-[13px] text-graphite outline-none"
        >
          {employeeOptions.map((e) => (
            <option key={e} value={e}>
              {e === "ALL" ? "All sizes" : e}
            </option>
          ))}
        </select>
        <a
          href={`/api/private/diagnostics/export${status !== "ALL" ? `?status=${status}` : ""}`}
          className="inline-flex h-10 items-center gap-1.5 rounded border border-line bg-white px-3 text-[13px] text-graphite hover:border-modus"
        >
          <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
          Export CSV
        </a>
      </div>

      {!loading && diagnostics.length === 0 && (
        <div className="mt-10">
          <EmptyState
            id="DIAGNOSTICS / 000"
            title="No diagnostics match."
            body="Try a different search or filter combination."
          />
        </div>
      )}

      {diagnostics.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-md border border-line bg-white">
          <table className="w-full min-w-[900px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-line font-mono text-[10px] uppercase tracking-[0.06em] text-muted">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Industry</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Primary Friction</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {diagnostics.map((d) => (
                <tr key={d.id} className="border-b border-line last:border-b-0 hover:bg-mineral">
                  <td className="whitespace-nowrap px-4 py-3 text-muted">
                    {new Date(d.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 font-medium text-ink">{d.companyName}</td>
                  <td className="px-4 py-3 text-graphite">
                    {d.firstName} / {d.email.replace(/^(.).*@/, "$1•••@")}
                  </td>
                  <td className="px-4 py-3 text-graphite">{d.industry}</td>
                  <td className="px-4 py-3 text-graphite">{d.employees}</td>
                  <td className="px-4 py-3 text-graphite">{d.primaryPainPoint}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-[10px] uppercase text-muted">{d.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/private/diagnostics/${d.id}`} className="text-modus hover:text-modus-light">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
