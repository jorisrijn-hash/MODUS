/**
 * Production PostgREST ownership verification.
 *
 *   node scripts/verify-ownership-production.mjs <production-clerk-user-id> <diagnostic-id>
 *
 * Temporarily assigns ONE synthetic diagnostic to the verified production
 * user, proves that row-level security returns exactly that record to its
 * owner and nothing else, then restores the original ownership in a
 * `finally` block so an assertion failure cannot leave the data changed.
 *
 * A zero-row result is treated as a FAILURE, not a pass. "Sees nothing"
 * is what a broken token also looks like, so the owner case must return
 * the specific record.
 *
 * The session token is never printed.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const load = (f) => { const o = {}; try { for (const l of readFileSync(f, "utf8").split("\n")) { const m = l.match(/^([A-Z_0-9]+)=(.*)$/); if (m) o[m[1]] = m[2].replace(/^["']|["']$/g, ""); } } catch {} return o; };
const prod = load(".env.production.local");
const db = load(".env.supabase.local");
const pub = load(".env.local");

const userId = process.argv[2];
const diagnosticId = process.argv[3];
const FAPI = "https://clerk.withmodus.co";
const url = pub.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = pub.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || pub.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!prod.CLERK_SECRET_KEY?.startsWith("sk_live")) { console.error("not a production key"); process.exit(1); }

let failed = false;
const pass = (m) => console.log(`  PASS  ${m}`);
const fail = (m) => { failed = true; console.log(`  FAIL  ${m}`); };

// ---- fresh production session token ---------------------------------
const t = await fetch("https://api.clerk.com/v1/sign_in_tokens", {
  method: "POST",
  headers: { Authorization: `Bearer ${prod.CLERK_SECRET_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({ user_id: userId, expires_in_seconds: 300 }),
}).then((r) => r.json());
const si = await fetch(`${FAPI}/v1/client/sign_ins?_is_native=1`, {
  method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ strategy: "ticket", ticket: t.token }),
});
const siBody = await si.json();
const clientToken = si.headers.get("authorization");
const sid = siBody?.client?.sessions?.[0]?.id ?? siBody?.response?.created_session_id;
const tok = await fetch(`${FAPI}/v1/client/sessions/${sid}/tokens?_is_native=1`, {
  method: "POST", headers: { Authorization: `Bearer ${clientToken}` },
}).then((r) => r.json());
const jwt = tok.jwt;
if (!jwt) { console.error("no session token"); process.exit(1); }

const claims = JSON.parse(Buffer.from(jwt.split(".")[1], "base64url").toString());
console.log("1. Fresh production session token (token itself never printed)");
console.log(`        claims present: ${Object.keys(claims).sort().join(", ")}`);
claims.iss === "https://clerk.withmodus.co"
  ? pass(`iss = ${claims.iss}`)
  : fail(`iss = ${claims.iss}, expected https://clerk.withmodus.co`);
claims.sub === userId ? pass(`sub = ${claims.sub}`) : fail(`sub = ${claims.sub}`);
claims.role === "authenticated"
  ? pass(`role = ${claims.role}`)
  : fail(`role = ${claims.role ?? "(ABSENT)"} — Supabase will treat this as anon`);

const prisma = new PrismaClient({ datasourceUrl: db.DIRECT_URL });
const target = await prisma.diagnostic.findUnique({ where: { id: diagnosticId }, select: { id: true, ownerId: true, companyName: true } });
if (!target) { console.error(`diagnostic ${diagnosticId} not found`); process.exit(1); }
if (!/SYNTHETIC/i.test(target.companyName)) {
  console.error(`refusing: ${diagnosticId} is not the synthetic record (company: ${target.companyName})`);
  process.exit(1);
}
const originalOwner = target.ownerId;
console.log(`\n2. Target record\n        ${target.id}\n        company: ${target.companyName}\n        original ownerId: ${originalOwner ?? "null (guest)"}`);

const others = await prisma.diagnostic.findMany({ where: { id: { not: diagnosticId } }, select: { id: true, ownerId: true } });
console.log(`        other records: ${others.length} (all should stay invisible)`);

try {
  await prisma.diagnostic.update({ where: { id: diagnosticId }, data: { ownerId: userId } });
  console.log(`\n3. Temporarily assigned to ${userId}`);

  // ---- anonymous ----------------------------------------------------
  console.log("\n4. Anonymous PostgREST client");
  const anon = createClient(url, anonKey);
  for (const table of ["Diagnostic", "AdminMember", "Profile"]) {
    const { data, error } = await anon.from(table).select("*").limit(1);
    (error || !data?.length) ? pass(`${table}: rejected${error ? ` (${error.code})` : " / no rows"}`) : fail(`${table}: anonymous READ ${data.length} row(s)`);
  }

  // ---- authenticated owner -------------------------------------------
  console.log("\n5. Authenticated PostgREST client (production Clerk token)");
  const authed = createClient(url, anonKey, { accessToken: async () => jwt });
  const res = await authed.from("Diagnostic").select("id,ownerId,companyName");
  if (res.error) {
    fail(`Diagnostic select errored: ${res.error.message} (${res.error.code})`);
  } else {
    const rows = res.data ?? [];
    // A zero-row result is NOT proof that ownership works.
    rows.length > 0
      ? pass(`returned ${rows.length} row(s) — non-empty, so this is a real read`)
      : fail("returned 0 rows — this is NOT proof ownership works; a broken token looks identical");
    rows.some((r) => r.id === diagnosticId)
      ? pass("the owned record IS returned to its owner")
      : fail("the owned record was NOT returned to its owner");
    const foreign = rows.filter((r) => r.ownerId !== userId);
    foreign.length === 0
      ? pass("no guest or other-owner records are visible")
      : fail(`${foreign.length} record(s) not owned by this user are visible: ${foreign.map((f) => f.id).join(", ")}`);
    rows.length === 1
      ? pass("exactly one record visible, which is the owned one")
      : fail(`expected exactly 1 visible record, saw ${rows.length}`);
  }

  const am = await authed.from("AdminMember").select("*").limit(1);
  (am.error || !am.data?.length) ? pass("AdminMember: still not readable") : fail("AdminMember: readable");
} finally {
  await prisma.diagnostic.update({ where: { id: diagnosticId }, data: { ownerId: originalOwner } });
  const after = await prisma.diagnostic.findUnique({ where: { id: diagnosticId }, select: { ownerId: true } });
  console.log(`\n6. Ownership restored -> ${after.ownerId ?? "null (guest)"}`);
  after.ownerId === originalOwner ? pass("original ownership restored") : fail(`restore failed: ${after.ownerId}`);

  const originals = await prisma.diagnostic.count({ where: { id: { not: diagnosticId } } });
  const untouched = await prisma.diagnostic.count({ where: { id: { not: diagnosticId }, ownerId: null } });
  console.log(`        other records: ${originals}, of which unowned: ${untouched}`);
  originals === others.length ? pass(`all ${others.length} other records still present`) : fail(`other record count changed: ${others.length} -> ${originals}`);
  await prisma.$disconnect();
}

console.log(failed ? "\nRESULT: FAILURES ABOVE\n" : "\nRESULT: all checks passed\n");
process.exit(failed ? 1 : 0);
