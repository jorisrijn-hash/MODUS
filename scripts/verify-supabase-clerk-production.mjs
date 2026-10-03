/**
 * Clerk -> Supabase verification against the PRODUCTION Clerk instance.
 *
 *   node scripts/verify-supabase-clerk-production.mjs <production-clerk-user-id>
 *
 * `verify-supabase-clerk.mjs` cannot do this. It mints a token with the
 * Backend API's POST /v1/sessions, which Clerk rejects on a production
 * instance:
 *
 *   "Request only valid for development instances." (request_invalid_for_environment)
 *
 * It also derives the issuer from NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
 * which locally is the development key — so it was checking the
 * development issuer's JWKS while claiming to verify production.
 *
 * This uses the flow Clerk supports on production instances instead:
 * create a short-lived sign-in token with the Backend API, then redeem it
 * against the Frontend API as a native client to obtain a real session
 * JWT. That is the same token the browser presents to PostgREST.
 *
 * Secrets are read from .env.production.local and never printed.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

for (const file of [".env.production.local", ".env.supabase.local", ".env.local", ".env"]) {
  try {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^([A-Z_0-9]+)=["']?([^"'\n]*)["']?$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {}
}

const userId = process.argv[2];
if (!userId?.startsWith("user_")) {
  console.error("Usage: node scripts/verify-supabase-clerk-production.mjs <user_...>");
  process.exit(1);
}

const clerkSecret = process.env.CLERK_SECRET_KEY;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const FAPI = process.env.CLERK_FRONTEND_API || "https://clerk.withmodus.co";

if (!clerkSecret?.startsWith("sk_live")) {
  console.error("CLERK_SECRET_KEY is not a production key (sk_live). Refusing.");
  process.exit(1);
}

let failed = false;
const pass = (m) => console.log(`  PASS  ${m}`);
const fail = (m) => { failed = true; console.log(`  FAIL  ${m}`); };

console.log(`Clerk frontend API: ${FAPI}`);
console.log(`Supabase project  : ${new URL(url).host}\n`);

// --- 1. Production issuer and JWKS -----------------------------------
const issuerHost = new URL(FAPI).host;
const jwks = await fetch(`${FAPI}/.well-known/jwks.json`).then((r) => r.json());
jwks.keys?.length ? pass(`JWKS published by ${issuerHost} (${jwks.keys.length} key)`) : fail("JWKS missing");

// --- 2. Real production session token ---------------------------------
const signInToken = await fetch("https://api.clerk.com/v1/sign_in_tokens", {
  method: "POST",
  headers: { Authorization: `Bearer ${clerkSecret}`, "Content-Type": "application/json" },
  body: JSON.stringify({ user_id: userId, expires_in_seconds: 120 }),
}).then(async (r) => {
  const b = await r.json();
  if (!r.ok) throw new Error(`sign_in_tokens -> ${r.status} ${JSON.stringify(b).slice(0, 200)}`);
  return b.token;
});
pass("created a production sign-in token");

const signIn = await fetch(`${FAPI}/v1/client/sign_ins?_is_native=1`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ strategy: "ticket", ticket: signInToken }),
});
const signInBody = await signIn.json();
if (!signIn.ok) throw new Error(`sign_ins -> ${signIn.status} ${JSON.stringify(signInBody).slice(0, 300)}`);
const clientToken = signIn.headers.get("authorization");
const sessionId = signInBody?.client?.sessions?.[0]?.id ?? signInBody?.response?.created_session_id;
if (!clientToken || !sessionId) throw new Error(`no client token/session: ${JSON.stringify(signInBody).slice(0, 300)}`);
pass("redeemed it for a production session");

const tokenRes = await fetch(`${FAPI}/v1/client/sessions/${sessionId}/tokens?_is_native=1`, {
  method: "POST",
  headers: { Authorization: `Bearer ${clientToken}` },
});
const tokenBody = await tokenRes.json();
const jwt = tokenBody.jwt;
if (!jwt) throw new Error(`no jwt: ${JSON.stringify(tokenBody).slice(0, 200)}`);

const claims = JSON.parse(Buffer.from(jwt.split(".")[1], "base64url").toString());
claims.sub === userId ? pass(`token sub = ${claims.sub}`) : fail(`token sub mismatch: ${claims.sub}`);
claims.iss?.includes(issuerHost)
  ? pass(`token iss = ${claims.iss} (production issuer)`)
  : fail(`unexpected iss: ${claims.iss}`);

// --- 3. Anonymous access rejected -------------------------------------
console.log("\nAnonymous client:");
const anon = createClient(url, anonKey);
for (const table of ["Diagnostic", "AdminMember", "Profile"]) {
  const { data, error } = await anon.from(table).select("*").limit(1);
  if (error || !data?.length) pass(`${table}: no rows${error ? ` (${error.code ?? "denied"})` : ""}`);
  else fail(`${table}: anonymous client READ ${data.length} row(s)`);
}

// --- 4. Authenticated access scoped to the owner ----------------------
console.log("\nAuthenticated client (production Clerk session token):");
const authed = createClient(url, anonKey, { accessToken: async () => jwt });

const own = await authed.from("Diagnostic").select("id,ownerId");
if (own.error) fail(`Diagnostic select errored: ${own.error.message}`);
else {
  const foreign = own.data.filter((r) => r.ownerId !== userId);
  pass(`sees ${own.data.length} diagnostic(s)`);
  foreign.length === 0 ? pass("every visible row is owned by this user") : fail(`${foreign.length} foreign row(s)`);
}

const admin = await authed.from("AdminMember").select("*").limit(1);
admin.error || !admin.data?.length
  ? pass("AdminMember: not readable from the browser role")
  : fail("AdminMember: readable by an ordinary account");

console.log(failed ? "\nRESULT: FAILURES ABOVE\n" : "\nRESULT: all checks passed\n");
process.exit(failed ? 1 : 0);
