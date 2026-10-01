import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { parseDiagnostic } from "@/lib/admin/types";
import { computeLeadFit } from "@/lib/admin/leadFit";
import { computeOpportunityTags } from "@/lib/admin/tags";
import { buildReviewBrief } from "@/lib/admin/reviewBrief";
import { findPossibleDuplicates } from "@/lib/admin/duplicates";
import { DiagnosticDetailView } from "@/components/admin/DiagnosticDetailView";

export default async function DiagnosticDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = await prisma.diagnostic.findUnique({
    where: { id },
    include: {
      notes: { orderBy: { createdAt: "desc" } },
      activityEvents: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!record) notFound();

  const diagnostic = parseDiagnostic(record);
  const leadFit = computeLeadFit(diagnostic);
  const tags = computeOpportunityTags(diagnostic);
  const reviewBrief = buildReviewBrief(diagnostic);
  const duplicates = await findPossibleDuplicates(id);

  return (
    <DiagnosticDetailView
      diagnostic={diagnostic}
      notes={record.notes}
      activity={record.activityEvents}
      leadFit={leadFit}
      tags={tags}
      reviewBrief={reviewBrief}
      duplicates={duplicates}
    />
  );
}
