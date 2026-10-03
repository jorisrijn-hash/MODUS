/**
 * Mints a development Clerk session token for a test user.
 *
 *   node scripts/mint-dev-session.mjs <user_...>
 *
 * Development instances accept POST /v1/sessions, which production
 * rejects — so this is only ever a local tool. It exists so the admin
 * surface can be driven in a browser for screenshots and functional
 * checks while clerk.signIn() remains blocked.
 *
 * Prints only the token, to stdout, for a test harness to consume. It is
 * a short-lived development credential for a throwaway account.
 */
import { readFileSync } from "node:fs";
const env = {};
for (const f of [".env.local", ".env"]) {
  try { for (const l of readFileSync(f, "utf8").split("\n")) { const m = l.match(/^([A-Z_0-9]+)=["']?([^"'\n]*)["']?$/); if (m && !env[m[1]]) env[m[1]] = m[2]; } } catch {}
}
const key = env.CLERK_SECRET_KEY;
if (!key?.startsWith("sk_test")) { console.error("development key required"); process.exit(1); }
const api = async (path, init) => {
  const r = await fetch(`https://api.clerk.com/v1${path}`, { ...init, headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...init?.headers } });
  const b = await r.json();
  if (!r.ok) throw new Error(`${path} -> ${r.status} ${JSON.stringify(b).slice(0, 200)}`);
  return b;
};
const session = await api("/sessions", { method: "POST", body: JSON.stringify({ user_id: process.argv[2] }) });
const { jwt } = await api(`/sessions/${session.id}/tokens`, { method: "POST", body: "{}" });
process.stdout.write(jwt);
