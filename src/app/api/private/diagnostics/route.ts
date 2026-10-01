import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/requireAuth";
import { parseDiagnostic } from "@/lib/admin/types";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("status");
  const industry = searchParams.get("industry");
  const employees = searchParams.get("employees");

  const where: Prisma.DiagnosticWhereInput = {};
  if (status && status !== "ALL") where.status = status;
  if (industry && industry !== "ALL") where.industry = industry;
  if (employees && employees !== "ALL") where.employees = employees;
  if (q) {
    where.OR = [
      { companyName: { contains: q } },
      { firstName: { contains: q } },
      { lastName: { contains: q } },
      { email: { contains: q } },
      { website: { contains: q } },
    ];
  }

  const diagnostics = await prisma.diagnostic.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ diagnostics: diagnostics.map(parseDiagnostic) });
}
