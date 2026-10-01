import { prisma } from "@/lib/db";

const WINDOW_MINUTES = 15;
const MAX_ATTEMPTS = 5;

export async function isRateLimited(ip: string): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);
  const recentFailures = await prisma.loginAttempt.count({
    where: { ip, success: false, createdAt: { gte: since } },
  });
  return recentFailures >= MAX_ATTEMPTS;
}

export async function recordLoginAttempt(ip: string, success: boolean) {
  await prisma.loginAttempt.create({ data: { ip, success } });
}

export async function recentFailedLoginCount(hours = 24): Promise<number> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  return prisma.loginAttempt.count({
    where: { success: false, createdAt: { gte: since } },
  });
}

export async function lastSuccessfulLogin() {
  return prisma.loginAttempt.findFirst({
    where: { success: true },
    orderBy: { createdAt: "desc" },
  });
}
