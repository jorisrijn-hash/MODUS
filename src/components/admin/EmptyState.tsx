import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function EmptyState({
  id,
  title,
  body,
  actionLabel,
  actionHref,
}: {
  id: string;
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">{id}</p>
      <h2 className="mt-3 text-xl font-semibold text-ink">{title}</h2>
      <p className="mt-2 max-w-sm text-[14px] text-muted">{body}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-modus"
        >
          {actionLabel}
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
        </Link>
      )}
    </div>
  );
}
