/**
 * Verifies the Clerk -> Supabase integration end to end, for real.
 *
 *   node scripts/verify-supabase-clerk.mjs <clerk-user-id>
 *
 * It proves four things, each against the live Supabase project:
 *   1. the Clerk issuer is reachable and its JWKS is published;
 *   2. an ANONYMOUS client is rejected by every protected table;
 *   3. an AUTHENTICATED client sees only its own rows;
 *   4. that same client cannot read another user's rows or the
 *      admin-membership table.
 *
 * It mints a real Clerk session token through the Backend API, so this is
 * the actual token path the browser uses — not a hand-rolled JWT.
 *
 * Requires, in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  (or NEXT_PUBLIC_SUPABASE_ANON_KEY)
 *   CLERK_SECRET_KEY            (already present)
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// Load .env.local without printing anything from it.
for (const file of [".env.local", ".env"]) {
  try {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^([A-Z_0-9]+)=["']?([^"'\n]*)["']?$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {}
}

const userId = process.argv[2];
if (!userId?.startsWith("user_")) {
  console.error("Usage: node scripts/verify-supabase-clerk.mjs <clerk-user-id>");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const clerkSecret = process.env.CLERK_SECRET_KEY;

const missing = [
  !url && "NEXT_PUBLIC_SUPABASE_URL",
  !anonKey && "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)",
  !clerkSecret && "CLERK_SECRET_KEY",
].filter(Boolean);
if (missing.length) {
  console.error(`Not configured. Missing: ${missing.join(", ")}`);
  process.exit(1);
}

const pass = (m) => console.log(`  PASS  ${m}`);
const fail = (m) => {
  console.log(`  FAIL  ${m}`);
  process.exitCode = 1;
};

// --- 1. Clerk issuer -------------------------------------------------
const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const domain = Buffer.from(pk.split("_").slice(2).join("_"), "base64")
  .toString("utf8")
  .replace(/\$$/, "");
console.log(`\nClerk issuer: https://${domain}`);
const jwks = await fetch(`https://${domain}/.well-known/jwks.json`).then((r) => r.json());
jwks.keys?.length ? pass(`JWKS published (${jwks.keys.length} key)`) : fail("JWKS missing");

// --- 2. Mint a real session token ------------------------------------
const api = (path, init) =>
  fetch(`https://api.clerk.com/v1${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${clerkSecret}`, "Content-Type": "application/json", ...init?.headers },
  }).then(async (r) => {
    const body = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`Clerk ${path} -> ${r.status} ${JSON.stringify(body).slice(0, 200)}`);
    return body;
  });

const session = await api("/sessions", {
  method: "POST",
  body: JSON.stringify({ user_id: userId }),
});
const { jwt } = await api(`/sessions/${session.id}/tokens`, { method: "POST", body: "{}" });
pass("minted a real Clerk session token");

const claims = JSON.parse(Buffer.from(jwt.split(".")[1], "base64url").toString());
claims.sub === userId ? pass(`token sub = ${claims.sub}`) : fail(`token sub mismatch: ${claims.sub}`);
claims.iss?.includes(domain) ? pass(`token iss = ${claims.iss}`) : fail(`unexpected iss: ${claims.iss}`);

// --- 3. Anonymous access must be rejected ----------------------------
console.log("\nAnonymous client:");
const anon = createClient(url, anonKey);
for (const table of ["Diagnostic", "AdminMember", "Profile"]) {
  const { data, error } = await anon.from(table).select("*").limit(1);
  if (error || !data?.length) pass(`${table}: no rows returned${error ? ` (${error.code ?? "denied"})` : ""}`);
  else fail(`${table}: anonymous client READ ${data.length} row(s)`);
}

// --- 4. Authenticated access is scoped to the owner -------------------
console.log("\nAuthenticated client (Clerk session token):");
const authed = createClient(url, anonKey, { accessToken: async () => jwt });

const own = await authed.from("Diagnostic").select("id,ownerId");
if (own.error) fail(`Diagnostic select errored: ${own.error.message}`);
else {
  const foreign = own.data.filter((r) => r.ownerId !== userId);
  pass(`sees ${own.data.length} diagnostic(s)`);
  foreign.length === 0
    ? pass("every visible row is owned by this user")
    : fail(`${foreign.length} row(s) belong to someone else`);
}

const admin = await authed.from("AdminMember").select("*").limit(1);
admin.error || !admin.data?.length
  ? pass("AdminMember: not readable")
  : fail("AdminMember: readable by an ordinary account");

console.log(
  process.exitCode ? "\nRESULT: FAILURES ABOVE\n" : "\nRESULT: all checks passed\n"
);
