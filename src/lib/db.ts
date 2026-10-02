import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Prisma client, constructed lazily on first actual use.
 *
 * It used to be `export const prisma = new PrismaClient()`, which runs at
 * import time. Next.js imports every route module during "Collecting page
 * data" in a production build, so on a deployment without DATABASE_URL set
 * that construction can fail and take the whole build down — the same
 * class of failure `SESSION_SECRET` caused in `src/lib/auth/session.ts`,
 * and the reason a freshly linked Vercel project served nothing and the
 * domain returned 404.
 *
 * The Proxy keeps every existing `import { prisma } from "@/lib/db"` call
 * site working unchanged: the client is only built when a property is
 * actually read, i.e. when a request really talks to the database. A
 * misconfigured database therefore fails that request, loudly, instead of
 * failing the build for pages that never touch it.
 */
let cached: PrismaClient | undefined;

function client(): PrismaClient {
  // Module-level cache, not only the dev global. Without it the Proxy
  // would construct a brand-new PrismaClient on every property access in
  // production, opening a connection per query.
  if (cached) return cached;
  // Dev reuses one instance across hot reloads so Next's module
  // re-evaluation doesn't exhaust the connection pool.
  cached = globalForPrisma.prisma ?? new PrismaClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = cached;
  return cached;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    return Reflect.get(client() as object, prop, receiver);
  },
  has(_target, prop) {
    return Reflect.has(client() as object, prop);
  },
});
