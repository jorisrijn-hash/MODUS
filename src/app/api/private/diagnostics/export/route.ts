import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/requireAuth";
import { parseDiagnostic } from "@/lib/admin/types";

const DANGEROUS_PREFIXES = ["=", "+", "-", "@"];

/** Prevent spreadsheet formula injection (CSV injection) on open in Excel/Sheets. */
function csvSafe(value: unknown): string {
  const str = String(value ?? "");
  const escaped = DANGEROUS_PREFIXES.some((p) => str.startsWith(p)) ? `'${str}` : str;
  if (/[",\n]/.test(escaped)) {
    return `"${escaped.replace(/"/g, '""')}"`;
  }
  return escaped;
}

const COLUMNS = [
  "createdAt",
  "status",
  "companyName",
  "website",
  "industry",
  "employees",
  "locations",
  "primaryPainPoint",
  "firstName",
  "lastName",
  "email",
  "phone",
] as const;

export async function GET(request: NextRequest) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const diagnostics = await prisma.diagnostic.findMany({
    where: status && status !== "ALL" ? { status } : undefined,
    orderBy: { createdAt: "desc" },
  });

  const rows = diagnostics.map(parseDiagnostic);
  const header = COLUMNS.join(",");
  const body = rows
    .map((r) => COLUMNS.map((col) => csvSafe(r[col as keyof typeof r])).join(","))
    .join("\n");
  const csv = `${header}\n${body}`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="modus-diagnostics-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
