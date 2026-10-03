import { prisma } from "@/lib/db";
import { parseDiagnostic, STATUSES } from "@/lib/admin/types";
import { PipelineBoard } from "@/components/admin/PipelineBoard";

export default async function PipelinePage() {
  const [groups, ...lanes] = await Promise.all([
    prisma.diagnostic.groupBy({ by: ["status"], _count: true }),
    ...STATUSES.map((status) =>
      prisma.diagnostic.findMany({
        where: { status },
        orderBy: { createdAt: "asc" },
        take: 20,
      }),
    ),
  ]);
  return (
    <PipelineBoard
      diagnostics={lanes.flat().map(parseDiagnostic)}
      totals={Object.fromEntries(
        groups.map((group) => [group.status, group._count]),
      )}
    />
  );
}
