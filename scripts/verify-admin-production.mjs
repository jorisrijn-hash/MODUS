/**
 * Admin allow / deny / revoke, against the live site.
 *
 *   node scripts/verify-admin-production.mjs <production-clerk-user-id>
 *
 * Uses a real production Clerk session token, obtained through the
 * sign-in-token flow (POST /v1/sessions is development-only). Membership
 * is changed through the same script an operator would use, and the
 * effect is observed on the deployed application — not inferred.
 */
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const load = (f) => { const o = {}; try { for (const l of readFileSync(f, "utf8").split("\n")) { const m = l.match(/^([A-Z_0-9]+)=(.*)$/); if (m) o[m[1]] = m[2].replace(/^["']|["']$/g, ""); } } catch {} return o; };
const prod = load(".env.production.local");
const db = load(".env.supabase.local");
const SITE = "https://www.withmodus.co";
const FAPI = "https://clerk.withmodus.co";
const userId = process.argv[2];

let failed = false;
const pass = (m) => console.log(`  PASS  ${m}`);
const fail = (m) => { failed = true; console.log(`  FAIL  ${m}`); };

async function sessionToken() {
  const t = await fetch("https://api.clerk.com/v1/sign_in_tokens", {
    method: "POST",
    headers: { Authorization: `Bearer ${prod.CLERK_SECRET_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, expires_in_seconds: 300 }),
  }).then((r) => r.json());
  const si = await fetch(`${FAPI}/v1/client/sign_ins?_is_native=1`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ strategy: "ticket", ticket: t.token }),
  });
  const body = await si.json();
  const clientToken = si.headers.get("authorization");
  const sid = body?.client?.sessions?.[0]?.id ?? body?.response?.created_session_id;
  const tok = await fetch(`${FAPI}/v1/client/sessions/${sid}/tokens?_is_native=1`, {
    method: "POST", headers: { Authorization: `Bearer ${clientToken}` },
  }).then((r) => r.json());
  return tok.jwt;
}

const probe = async (jwt, path) => {
  const res = await fetch(SITE + path, {
    headers: jwt ? { Authorization: `Bearer ${jwt}`, Cookie: `__session=${jwt}` } : {},
    redirect: "manual",
  });
  let body = {};
  try { body = await res.json(); } catch {}
  return { status: res.status, body };
};

const setMembership = (revoke) =>
  execFileSync("node", ["scripts/grant-admin.mjs", ...(revoke ? ["--revoke"] : []), userId], {
    env: { ...process.env, DATABASE_URL: db.DATABASE_URL, DIRECT_URL: db.DIRECT_URL },
    encoding: "utf8",
  }).trim().split("\n")[0];

console.log(`user: ${userId}\n`);

console.log("1. Anonymous");
{
  const s = await probe(null, "/api/admin/status");
  s.body?.admin === false ? pass("/api/admin/status -> admin:false") : fail(`-> ${s.status} ${JSON.stringify(s.body)}`);
  const o = await probe(null, "/api/private/overview");
  o.status === 401 ? pass("/api/private/overview -> 401") : fail(`-> ${o.status}`);
}

console.log("\n2. Signed in WITH admin membership");
{
  const jwt = await sessionToken();
  const s = await probe(jwt, "/api/admin/status");
  s.body?.admin === true ? pass("/api/admin/status -> admin:true") : fail(`/api/admin/status -> ${s.status} ${JSON.stringify(s.body)}`);
  const o = await probe(jwt, "/api/private/overview");
  o.status === 200 ? pass("/api/private/overview -> 200 (admin inbox reachable)") : fail(`/api/private/overview -> ${o.status} ${JSON.stringify(o.body).slice(0,120)}`);
}

console.log("\n3. Membership revoked — effect on the NEXT request");
{
  console.log(`  ${setMembership(true)}`);
  const jwt = await sessionToken();
  const s = await probe(jwt, "/api/admin/status");
  s.body?.admin === false ? pass("/api/admin/status -> admin:false immediately after revocation") : fail(`-> ${JSON.stringify(s.body)}`);
  const o = await probe(jwt, "/api/private/overview");
  o.status === 403 ? pass("/api/private/overview -> 403 (same session, no sign-out needed)") : fail(`-> ${o.status}`);
}

console.log("\n4. Membership restored");
{
  console.log(`  ${setMembership(false)}`);
  const jwt = await sessionToken();
  const s = await probe(jwt, "/api/admin/status");
  s.body?.admin === true ? pass("/api/admin/status -> admin:true again") : fail(`-> ${JSON.stringify(s.body)}`);
  const o = await probe(jwt, "/api/private/overview");
  o.status === 200 ? pass("/api/private/overview -> 200") : fail(`-> ${o.status}`);
}

const prisma = new PrismaClient({ datasourceUrl: db.DIRECT_URL });
const rows = await prisma.adminMember.findMany({ where: { userId }, select: { revokedAt: true } });
const active = rows.filter((r) => r.revokedAt === null).length;
console.log(`\nfinal membership rows: ${rows.length} (${active} active)`);
active === 1 ? pass("intended membership restored") : fail(`expected exactly 1 active membership, found ${active}`);
await prisma.$disconnect();

console.log(failed ? "\nRESULT: FAILURES ABOVE\n" : "\nRESULT: all checks passed\n");
process.exit(failed ? 1 : 0);
