import Link from "next/link";
import { prisma } from "@/lib/db";
import { parseDiagnostic, STATUSES } from "@/lib/admin/types";
import { computeOpportunityTags } from "@/lib/admin/tags";
import { EmptyState } from "@/components/admin/EmptyState";

export default async function PipelinePage() {
  const all = await prisma.diagnostic.findMany({ orderBy: { createdAt: "desc" } });

  if (all.length === 0) {
    return (
      <EmptyState
        id="PIPELINE / 000"
        title="No diagnostics yet."
        body="New submissions will appear here as leads move through the pipeline."
      />
    );
  }

  const diagnostics = all.map(parseDiagnostic);
  const columns = STATUSES.filter((s) => s !== "REVIEWED"); // fold REVIEWED into REVIEWING visually for a lean V1 board

  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">MODUS / Pipeline</p>
      <h1 className="mt-2 text-2xl font-semibold text-ink">Where every lead stands.</h1>

      <div className="mt-8 flex gap-4 overflow-x-auto pb-4">
        {columns.map((status) => {
          const items = diagnostics.filter((d) => d.status === status || (status === "REVIEWING" && d.status === "REVIEWED"));
          return (
            <div key={status} className="w-[260px] shrink-0">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted">{status}</p>
                <span className="font-mono text-[10px] text-muted">{items.length}</span>
              </div>
              <div className="mt-3 space-y-2.5">
                {items.length === 0 && (
                  <p className="rounded-sm border border-dashed border-line p-3 text-[12px] text-muted">
                    Nothing in this stage.
                  </p>
                )}
                {items.map((d) => {
                  const tags = computeOpportunityTags(d);
                  return (
                    <Link
                      key={d.id}
                      href={`/private/diagnostics/${d.id}`}
                      className="block rounded-sm border border-line bg-white p-3 hover:border-modus"
                    >
                      <p className="text-[13px] font-medium text-ink">{d.companyName}</p>
                      <p className="mt-0.5 text-[11.5px] text-muted">{d.industry}</p>
                      <p className="mt-1.5 text-[11.5px] text-graphite">{d.primaryPainPoint}</p>
                      {tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="rounded-sm bg-mineral px-1.5 py-0.5 font-mono text-[9px] uppercase text-muted">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="mt-2 font-mono text-[9px] uppercase text-muted">
                        {new Date(d.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
