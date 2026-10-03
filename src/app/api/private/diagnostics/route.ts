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

  /*
   * Date range, inclusive of the whole `to` day. Submitted as plain
   * `YYYY-MM-DD` from a date input; anything unparseable is ignored
   * rather than turned into an epoch-0 bound that would silently hide
   * every record.
   */
  const from = parseDate(searchParams.get("from"));
  const to = parseDate(searchParams.get("to"));
  if (from || to) {
    where.createdAt = {
      ...(from ? { gte: from } : {}),
      ...(to ? { lt: new Date(to.getTime() + 24 * 60 * 60 * 1000) } : {}),
    };
  }

  /*
   * Real pagination, replacing a flat `take: 200`. That cap silently
   * truncated: the 201st diagnostic simply did not exist as far as the
   * inbox was concerned, with nothing on screen to say so.
   */
  const pageSize = clamp(Number(searchParams.get("pageSize")) || 25, 5, 100);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const [total, diagnostics] = await Promise.all([
    prisma.diagnostic.count({ where }),
    prisma.diagnostic.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    diagnostics: diagnostics.map(parseDiagnostic),
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  });
}

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}
