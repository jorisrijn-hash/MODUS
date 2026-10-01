"use client";

import { useState } from "react";
import { Download, FileText, Check } from "lucide-react";
import { PageHeader } from "@/components/app/ui/PageHeader";
import { AppCard } from "@/components/app/ui/AppCard";
import { REPORTS } from "@/lib/appDemo/data";

export default function ReportsPage() {
  const [downloaded, setDownloaded] = useState<string | null>(null);

  function handleDownload(id: string) {
    setDownloaded(id);
    window.setTimeout(() => setDownloaded(null), 2200);
  }

  return (
    <div>
      <PageHeader title="Reports" subtitle="Monthly summaries of business performance and MODUS activity." />

      <div className="space-y-3">
        {REPORTS.map((report) => (
          <AppCard key={report.id}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-mineral">
                  <FileText className="h-4.5 w-4.5 text-modus" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-[14px] font-medium text-ink">{report.month}</p>
                  <p className="text-[12px] text-muted">Generated {report.generated}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDownload(report.id)}
                className="flex shrink-0 items-center gap-2 rounded-md border border-line px-3.5 py-2 text-[12.5px] font-medium text-graphite transition-colors hover:border-ink/30"
              >
                {downloaded === report.id ? (
                  <>
                    <Check className="h-4 w-4 text-modus" strokeWidth={2} /> Downloaded
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" strokeWidth={1.75} /> Download
                  </>
                )}
              </button>
            </div>
            <p className="mt-3 border-t border-line pt-3 text-[13px] text-graphite">{report.headline}</p>
          </AppCard>
        ))}
      </div>

      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.06em] text-muted">
        Demo environment — download is a mock interaction
      </p>
    </div>
  );
}
