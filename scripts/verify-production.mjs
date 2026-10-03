/**
 * Post-deployment verification against the live site.
 *
 *   node scripts/verify-production.mjs
 *
 * Creates ONE clearly-labelled synthetic diagnostic, authorized by the
 * user on 3 October 2026. It contains no real customer information: the
 * company, the names and the email are all obviously synthetic and the
 * record is tagged in its own fields so it can be found and removed
 * later. The four original diagnostics are counted before and after and
 * must be unchanged.
 *
 * Reads the production database through `.env.supabase.local` only, and
 * never prints a credential.
 */
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

for (const file of [".env.supabase.local"]) {
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_0-9]+)=["']?([^"'\n]*)["']?$/);
    if (m) process.env[m[1]] = m[2];
  }
}

const SITE = process.env.VERIFY_SITE || "https://www.withmodus.co";
const prisma = new PrismaClient({ datasourceUrl: process.env.DIRECT_URL });

let failures = 0;
const pass = (m) => console.log(`  PASS  ${m}`);
const fail = (m) => { failures++; console.log(`  FAIL  ${m}`); };
const info = (m) => console.log(`        ${m}`);

console.log(`Target: ${SITE}`);
console.log(`Database host: ${new URL(process.env.DIRECT_URL).host}\n`);

// ---------------------------------------------------------------- public
console.log("1. Public and guest routes");
for (const path of ["/", "/diagnostic", "/pricing", "/how-it-works", "/legal", "/privacypolicy", "/sitemap.xml", "/robots.txt"]) {
  const res = await fetch(SITE + path, { redirect: "manual" });
  res.status === 200 ? pass(`${path} -> 200`) : fail(`${path} -> ${res.status}`);
}

console.log("\n2. Admin surface is closed");
for (const path of ["/private", "/private/diagnostics", "/private/settings"]) {
  const res = await fetch(SITE + path, { redirect: "manual" });
  const loc = res.headers.get("location") ?? "";
  res.status === 307 && loc.includes("/sign-in")
    ? pass(`${path} -> ${res.status} to Clerk sign-in`)
    : fail(`${path} -> ${res.status} location=${loc || "none"}`);
}
for (const path of ["/api/private/diagnostics", "/api/private/overview", "/api/private/diagnostics/export"]) {
  const res = await fetch(SITE + path);
  const body = await res.text();
  const leaks = /companyName|firstName|"email"/i.test(body);
  res.status === 401 && !leaks ? pass(`${path} -> 401, no data`) : fail(`${path} -> ${res.status} leaks=${leaks}`);
}
{
  /*
   * Asserting a 404 status here is wrong in production: Next renders the
   * not-found PAGE for a POST to a path with no handler, and serves it
   * with status 200. A GET to the same path does return 404. What
   * actually matters is that no handler ran — no session was issued and
   * no login was accepted — so that is what this checks.
   */
  const res = await fetch(SITE + "/api/private/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "admin", password: "whatever" }),
  });
  const body = await res.text();
  const matched = res.headers.get("x-matched-path") ?? "";
  const setCookie = res.headers.get("set-cookie") ?? "";
  const noHandler = matched.includes("_not-found") || res.status === 404 || /could not be found/i.test(body);
  const noSession = !/modus_private_session/i.test(setCookie);
  noHandler && noSession
    ? pass(`/api/private/login has no handler (matched ${matched || "none"}), issues no session`)
    : fail(`/api/private/login -> ${res.status} matched=${matched} setCookie=${setCookie.slice(0, 60)}`);
}
{
  const res = await fetch(SITE + "/api/admin/status");
  const body = await res.json().catch(() => ({}));
  res.ok && body.admin === false
    ? pass("/api/admin/status -> admin:false for an anonymous caller")
    : fail(`/api/admin/status -> ${res.status} ${JSON.stringify(body)}`);
}

console.log("\n3. Notification worker rejects unauthorized callers");
for (const [label, headers] of [
  ["no credentials", {}],
  ["wrong secret", { Authorization: "Bearer not-the-secret" }],
  ["bare vercel cron header", { "x-vercel-cron": "1" }],
]) {
  const res = await fetch(SITE + "/api/cron/notifications", { headers });
  res.status === 401 ? pass(`${label} -> 401`) : fail(`${label} -> ${res.status}`);
}

// ------------------------------------------------------- guest submission
console.log("\n4. Guest submission persistence and safe retry");
const before = await prisma.diagnostic.count();
const originals = await prisma.diagnostic.findMany({
  where: { email: { not: { contains: "synthetic-test" } } },
  select: { id: true },
});
info(`diagnostics before: ${before} (${originals.length} not synthetic)`);

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const idempotencyKey = `synthetic-production-check-${stamp}`;
const payload = {
  companyName: "SYNTHETIC TEST RECORD — MODUS deployment check",
  website: "", industry: "Restaurant / Café", employees: "1-5", locations: "1", revenueRange: "",
  reachChannels: ["Phone"], enquiryHandling: ["Shared inbox"], adminHours: "A few hours",
  processStandardization: 3, dependency: "Low",
  systems: ["CRM"], specificTools: "", connectionLevel: "Partly connected",
  spreadsheetDependency: "Some", automationUsage: ["None"],
  friction: ["Administration"], primaryPain: "Administration",
  problemDescription: "Synthetic record created to verify the production deployment. Not a real enquiry.",
  frequency: "Weekly", impact: ["Time"],
  primaryInterest: "Automation", priorities: ["Save time"], timing: "Within 3 months",
  decisionContext: "", firstName: "Synthetic", lastName: "Test",
  email: `synthetic-test+${stamp}@withmodus.co`, phone: "", role: "",
  preliminaryProfile: [], preliminarySignals: [],
};

async function submit() {
  const res = await fetch(SITE + "/api/diagnostic", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
    body: JSON.stringify(payload),
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

const first = await submit();
first.status === 200 && first.body.id
  ? pass(`submission persisted -> id ${first.body.id}`)
  : fail(`submission -> ${first.status} ${JSON.stringify(first.body).slice(0, 200)}`);

const retry = await submit();
retry.body.id === first.body.id && retry.body.deduplicated === true
  ? pass("retry with the same Idempotency-Key returned the same record, deduplicated")
  : fail(`retry -> ${JSON.stringify(retry.body).slice(0, 200)}`);

const after = await prisma.diagnostic.count();
after === before + 1
  ? pass(`exactly one record created (${before} -> ${after})`)
  : fail(`record count ${before} -> ${after}, expected ${before + 1}`);

const stillThere = await prisma.diagnostic.count({ where: { id: { in: originals.map((o) => o.id) } } });
stillThere === originals.length
  ? pass(`all ${originals.length} pre-existing diagnostics preserved`)
  : fail(`only ${stillThere}/${originals.length} pre-existing diagnostics found`);

// ------------------------------------------------------------- outbox
console.log("\n5. Notification queued exactly once");
const key = `diagnostic.submitted:${first.body.id}`;
const rows = await prisma.notificationOutbox.findMany({ where: { dedupeKey: key } });
rows.length === 1 ? pass(`one outbox row for the submission`) : fail(`${rows.length} outbox rows for ${key}`);
if (rows[0]) {
  info(`status=${rows[0].status} attempts=${rows[0].attempts} recipient=${rows[0].recipient}`);
  info(`sentAt=${rows[0].sentAt} lastError=${rows[0].lastError ?? "none"}`);
  if (rows[0].status === "SENT") pass("notification reported SENT by the provider");
  else if (rows[0].status === "PENDING") info("still PENDING — the daily sweep will retry; receipt is yours to confirm");
  else fail(`unexpected status ${rows[0].status}`);
}

console.log(`\nSynthetic record id: ${first.body.id}`);
console.log(`Synthetic record email: ${payload.email}`);
console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
await prisma.$disconnect();
process.exit(failures === 0 ? 0 : 1);
