/**
 * Runs a command against the PRODUCTION database.
 *
 *   node scripts/with-production-db.mjs <command> [args...]
 *
 * Exists because extracting a connection string with shell tools is
 * fragile — a password containing `=` or quote characters produced a
 * mangled URL and a confusing Prisma validation error. This parses
 * `.env.supabase.local` in Node and passes the values through the child
 * process environment, so nothing is re-quoted and nothing is printed.
 *
 * It prints the target host, never the credentials, and refuses to run
 * against anything that is not the Supabase project.
 */
import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";

const env = {};
for (const line of readFileSync(".env.supabase.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z_0-9]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
if (!env.DATABASE_URL || !env.DIRECT_URL) {
  console.error("DATABASE_URL / DIRECT_URL missing from .env.supabase.local");
  process.exit(1);
}
const host = new URL(env.DIRECT_URL).host;
if (!host.includes("supabase.com")) {
  console.error(`Refusing: ${host} is not the Supabase project.`);
  process.exit(1);
}
console.log(`[production] ${host}`);

const [cmd, ...args] = process.argv.slice(2);
spawn(cmd, args, {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: env.DATABASE_URL, DIRECT_URL: env.DIRECT_URL },
}).on("exit", (code) => process.exit(code ?? 1));
