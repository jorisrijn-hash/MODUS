/**
 * Deploys the reviewed migrations to Supabase, imports the existing
 * diagnostics and verifies the result.
 *
 *   node scripts/deploy-supabase.mjs
 *
 * Reads DATABASE_URL and DIRECT_URL from .env.local / .env. It never
 * prints a connection string, only the host, so a terminal log or a
 * screenshot cannot leak the database password.
 *
 * Refuses to run unless the configuration actually looks like Supabase,
 * because the failure mode of getting this wrong is applying migrations to
 * the wrong database.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

for (const file of [".env.local", ".env"]) {
  try {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^([A-Z_0-9]+)=["']?([^"'\n]*)["']?$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {}
}

const pooled = process.env.DATABASE_URL ?? "";
const direct = process.env.DIRECT_URL ?? "";

/** Host and port only — never the credentials. */
function describe(url) {
  try {
    const u = new URL(url);
    return `${u.hostname}:${u.port || "5432"}`;
  } catch {
    return "(unparseable)";
  }
}

const problems = [];
if (!pooled) problems.push("DATABASE_URL is not set");
if (!direct) problems.push("DIRECT_URL is not set");
if (pooled.includes("localhost") || pooled.includes("127.0.0.1"))
  problems.push("DATABASE_URL still points at localhost — set it to the Supabase POOLED string");
if (direct.includes("localhost") || direct.includes("127.0.0.1"))
  problems.push("DIRECT_URL still points at localhost — set it to the Supabase DIRECT string");

if (pooled && direct) {
  const p = (() => { try { return new URL(pooled); } catch { return null; } })();
  const d = (() => { try { return new URL(direct); } catch { return null; } })();
  // Migrations cannot run through a transaction pooler. Catching a swap
  // here is far cheaper than a half-applied migration.
  if (d && d.port === "6543")
    problems.push("DIRECT_URL is the pooled port 6543 — migrations need the DIRECT connection (5432)");
  if (p && d && p.port === d.port && p.port !== "5432")
    problems.push("DATABASE_URL and DIRECT_URL look identical — they should be the pooler and the direct connection");
}

if (problems.length) {
  console.error("Refusing to deploy:\n" + problems.map((p) => `  - ${p}`).join("\n"));
  console.error("\nSee MODUS_PROVIDER_SETUP.md §1. Put both in .env.local; never commit them.");
  process.exit(1);
}

console.log(`pooled (runtime)   : ${describe(pooled)}`);
console.log(`direct (migrations): ${describe(direct)}\n`);

const run = (cmd, args) => {
  console.log(`$ ${cmd} ${args.join(" ")}`);
  execFileSync(cmd, args, { stdio: "inherit" });
};

console.log("— applying migrations —");
run("npx", ["prisma", "migrate", "deploy"]);

console.log("\n— importing existing records —");
run("node", ["scripts/migration/import-postgres.mjs"]);

console.log("\n— verifying —");
const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();
const expected = JSON.parse(readFileSync("prisma/export/sqlite-export.json", "utf8")).diagnostics;
const present = await prisma.diagnostic.findMany({ select: { id: true } });
const presentIds = new Set(present.map((d) => d.id));
const missing = expected.filter((d) => !presentIds.has(d.id));

console.log(`  diagnostics in Supabase : ${present.length}`);
console.log(`  original records        : ${expected.length}`);
console.log(`  missing originals       : ${missing.length}`);
if (missing.length) {
  console.error("\nFAIL: original records did not survive:", missing.map((d) => d.id));
  process.exitCode = 1;
} else {
  console.log("\nAll original diagnostics present.");
  console.log("Next: node scripts/verify-supabase-clerk.mjs <clerk-user-id>");
}
await prisma.$disconnect();
