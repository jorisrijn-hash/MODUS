/**
 * Proves OWNERSHIP isolation on production, separately from admin access.
 *
 *   node scripts/verify-ownership-isolation.mjs <user-id> <diagnostic-id>
 *
 * The first attempt at this asserted that an owner sees exactly one row
 * and failed, reporting four guest records as exposed. The policies were
 * right and the assertion was wrong: `Diagnostic` carries two permissive
 * SELECT policies, `ownerId = current_clerk_id()` and `is_modus_admin()`,
 * and Postgres ORs permissive policies together. The account under test
 * had just been granted admin, so it saw everything by design.
 *
 * Ownership isolation therefore has to be measured with admin membership
 * OFF. This revokes it for the duration, runs the check, and restores
 * both the membership and the record's ownership in `finally`, so a
 * failed assertion cannot leave either changed.
 *
 * A zero-row result is a FAILURE, not a pass.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const load = (f) => { const o = {}; try { for (const l of readFileSync(f, "utf8").split("\n")) { const m = l.match(/^([A-Z_0-9]+)=(.*)$/); if (m) o[m[1]] = m[2].replace(/^["']|["']$/g, ""); } } catch {} return o; };
const prod = load(".env.production.local"), db = load(".env.supabase.local"), pub = load(".env.local");
const userId = process.argv[2], diagnosticId = process.argv[3];
const FAPI = "https://clerk.withmodus.co";
const url = pub.NEXT_PUBLIC_SUPABASE_URL, anonKey = pub.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || pub.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let failed = false;
const pass = (m) => console.log(`  PASS  ${m}`);
const fail = (m) => { failed = true; console.log(`  FAIL  ${m}`); };

async function freshToken() {
  const t = await fetch("https://api.clerk.com/v1/sign_in_tokens", {
    method: "POST", headers: { Authorization: `Bearer ${prod.CLERK_SECRET_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, expires_in_seconds: 300 }),
  }).then((r) => r.json());
  const si = await fetch(`${FAPI}/v1/client/sign_ins?_is_native=1`, {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ strategy: "ticket", ticket: t.token }),
  });
  const b = await si.json();
  const sid = b?.client?.sessions?.[0]?.id ?? b?.response?.created_session_id;
  const tok = await fetch(`${FAPI}/v1/client/sessions/${sid}/tokens?_is_native=1`, {
    method: "POST", headers: { Authorization: si.headers.get("authorization") },
  }).then((r) => r.json());
  return tok.jwt;
}

const prisma = new PrismaClient({ datasourceUrl: db.DIRECT_URL });
const target = await prisma.diagnostic.findUnique({ where: { id: diagnosticId }, select: { ownerId: true, companyName: true } });
if (!/SYNTHETIC/i.test(target.companyName)) { console.error("not the synthetic record; refusing"); process.exit(1); }
const originalOwner = target.ownerId;
const otherIds = (await prisma.diagnostic.findMany({ where: { id: { not: diagnosticId } }, select: { id: true } })).map((r) => r.id);

console.log(`record   : ${diagnosticId} (${target.companyName})`);
console.log(`owner    : ${originalOwner ?? "null (guest)"} -> ${userId} for the duration`);
console.log(`others   : ${otherIds.length} guest records that must stay invisible\n`);

try {
  await prisma.diagnostic.update({ where: { id: diagnosticId }, data: { ownerId: userId } });
  await prisma.adminMember.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
  console.log("admin membership temporarily revoked, so only the ownership policy applies\n");

  const jwt = await freshToken();
  const claims = JSON.parse(Buffer.from(jwt.split(".")[1], "base64url").toString());
  console.log("1. Token (never printed)");
  claims.iss === FAPI ? pass(`iss = ${claims.iss}`) : fail(`iss = ${claims.iss}`);
  claims.role === "authenticated" ? pass(`role = ${claims.role}`) : fail(`role = ${claims.role ?? "(ABSENT)"}`);

  console.log("\n2. Anonymous");
  const anon = createClient(url, anonKey);
  for (const table of ["Diagnostic", "AdminMember", "Profile"]) {
    const { data, error } = await anon.from(table).select("*").limit(1);
    (error || !data?.length) ? pass(`${table}: rejected${error ? ` (${error.code})` : ""}`) : fail(`${table}: READ ${data.length} row(s)`);
  }

  console.log("\n3. Authenticated, NOT an admin");
  const authed = createClient(url, anonKey, { accessToken: async () => jwt });
  const res = await authed.from("Diagnostic").select("id,ownerId");
  if (res.error) fail(`select errored: ${res.error.message}`);
  else {
    const rows = res.data ?? [];
    rows.length > 0 ? pass(`returned ${rows.length} row(s) — a real read, not an empty one`) : fail("returned 0 rows — NOT proof; a broken token looks the same");
    rows.some((r) => r.id === diagnosticId) ? pass("the owned record IS returned to its owner") : fail("the owned record was NOT returned");
    const leaked = rows.filter((r) => otherIds.includes(r.id));
    leaked.length === 0 ? pass(`none of the ${otherIds.length} guest records are visible`) : fail(`guest records exposed: ${leaked.map((l) => l.id).join(", ")}`);
    rows.length === 1 ? pass("exactly one record visible, and it is the owned one") : fail(`expected 1 row, saw ${rows.length}`);
  }
  const am = await authed.from("AdminMember").select("*").limit(1);
  (am.error || !am.data?.length) ? pass("AdminMember: not readable") : fail("AdminMember: readable");
} finally {
  await prisma.diagnostic.update({ where: { id: diagnosticId }, data: { ownerId: originalOwner } });
  await prisma.adminMember.updateMany({ where: { userId }, data: { revokedAt: null } });
  const owner = (await prisma.diagnostic.findUnique({ where: { id: diagnosticId }, select: { ownerId: true } })).ownerId;
  const active = await prisma.adminMember.count({ where: { userId, revokedAt: null } });
  const guests = await prisma.diagnostic.count({ where: { id: { in: otherIds }, ownerId: null } });
  console.log("\n4. Restored");
  owner === originalOwner ? pass(`ownership -> ${owner ?? "null (guest)"}`) : fail(`ownership restore failed: ${owner}`);
  active === 1 ? pass("admin membership restored (1 active row)") : fail(`expected 1 active membership, found ${active}`);
  guests === otherIds.length ? pass(`all ${otherIds.length} original records untouched and still unowned`) : fail(`only ${guests}/${otherIds.length} originals unowned`);
  await prisma.$disconnect();
}
console.log(failed ? "\nRESULT: FAILURES ABOVE\n" : "\nRESULT: all checks passed\n");
process.exit(failed ? 1 : 0);
