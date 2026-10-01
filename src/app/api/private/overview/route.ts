import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/requireAuth";
import { parseDiagnostic } from "@/lib/admin/types";

export async function GET() {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [total, byStatus, last7Days, recent] = await Promise.all([
    prisma.diagnostic.count(),
    prisma.diagnostic.groupBy({ by: ["status"], _count: true }),
    prisma.diagnostic.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.diagnostic.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  const statusCounts = Object.fromEntries(byStatus.map((s) => [s.status, s._count]));

  const needsAttention = await prisma.diagnostic.findMany({
    where: { status: "NEW" },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return NextResponse.json({
    total,
    statusCounts,
    last7Days,
    recent: recent.map(parseDiagnostic),
    needsAttention: needsAttention.map(parseDiagnostic),
  });
}
