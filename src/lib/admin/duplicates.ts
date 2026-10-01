import { prisma } from "@/lib/db";

function domainOf(value: string | null): string | null {
  if (!value) return null;
  const emailMatch = value.match(/@([\w.-]+)$/);
  if (emailMatch) return emailMatch[1].toLowerCase();
  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    return url.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

export async function findPossibleDuplicates(diagnosticId: string) {
  const current = await prisma.diagnostic.findUnique({ where: { id: diagnosticId } });
  if (!current) return [];

  const emailDomain = domainOf(current.email);
  const siteDomain = domainOf(current.website);

  const candidates = await prisma.diagnostic.findMany({
    where: { id: { not: diagnosticId } },
    select: { id: true, companyName: true, email: true, website: true, createdAt: true },
  });

  return candidates.filter((c) => {
    if (c.companyName.trim().toLowerCase() === current.companyName.trim().toLowerCase()) return true;
    const cEmailDomain = domainOf(c.email);
    if (emailDomain && cEmailDomain && emailDomain === cEmailDomain) return true;
    const cSiteDomain = domainOf(c.website);
    if (siteDomain && cSiteDomain && siteDomain === cSiteDomain) return true;
    return false;
  });
}
