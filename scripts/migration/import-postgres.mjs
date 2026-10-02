/**
 * Re-imports the SQLite export into the Postgres database.
 *
 * Non-destructive by design:
 *  - `createMany` with `skipDuplicates`, keyed on the original primary
 *    keys, so running it twice cannot duplicate a submission.
 *  - It never deletes, truncates or updates an existing row. If a record
 *    is already present it is left exactly as it is.
 *  - It refuses to run against a database that already holds MORE
 *    diagnostics than the export, which is the signal that the target has
 *    live submissions the export does not know about.
 *
 * Dates arrive from JSON as strings and must be revived, or Postgres
 * rejects them where SQLite would have coerced.
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync, writeFileSync } from "node:fs";

const file = process.argv[2] || "prisma/export/sqlite-export.json";
const prisma = new PrismaClient();
const data = JSON.parse(readFileSync(file, "utf8"));

const DATE_FIELDS = new Set([
  "createdAt",
  "updatedAt",
  "statusUpdatedAt",
  "proposalSentAt",
]);

function revive(row) {
  const out = { ...row };
  for (const key of Object.keys(out)) {
    if (DATE_FIELDS.has(key) && typeof out[key] === "string") out[key] = new Date(out[key]);
  }
  return out;
}

const existing = await prisma.diagnostic.count();
if (existing > data.diagnostics.length) {
  console.error(
    `REFUSING: target holds ${existing} diagnostics, export has ${data.diagnostics.length}.\n` +
      `The target has records this export does not contain. Importing could only confuse\n` +
      `the picture. Reconcile manually.`
  );
  await prisma.$disconnect();
  process.exit(1);
}

// SQLite does not enforce foreign keys unless PRAGMA foreign_keys is on,
// and it was not. The source database therefore contains child rows whose
// parent diagnostic was deleted long ago. Postgres enforces the constraint
// and rejects the whole batch.
//
// Orphans are partitioned out and REPORTED rather than silently dropped:
// they are audit trail for records that no longer exist, so they have
// nothing to attach to and no meaning on their own. Every orphan id is
// written to a sidecar file so the decision stays reviewable.
const liveIds = new Set(data.diagnostics.map((d) => d.id));
const partition = (rows) => ({
  keep: rows.filter((r) => liveIds.has(r.diagnosticId)),
  orphans: rows.filter((r) => !liveIds.has(r.diagnosticId)),
});

const notes = partition(data.notes);
const events = partition(data.activityEvents);

if (notes.orphans.length || events.orphans.length) {
  const report = {
    note: "Child rows whose parent Diagnostic no longer exists in the export. Not imported.",
    notes: notes.orphans,
    activityEvents: events.orphans,
  };
  writeFileSync("prisma/export/orphaned-rows.json", JSON.stringify(report, null, 2));
  console.warn(
    `ORPHANS (parent diagnostic deleted, not imported):\n` +
      `  notes:          ${notes.orphans.length} of ${data.notes.length}\n` +
      `  activityEvents: ${events.orphans.length} of ${data.activityEvents.length}\n` +
      `  written to prisma/export/orphaned-rows.json\n`
  );
}

const results = {
  diagnostics: await prisma.diagnostic.createMany({
    data: data.diagnostics.map(revive),
    skipDuplicates: true,
  }),
  notes: await prisma.note.createMany({ data: notes.keep.map(revive), skipDuplicates: true }),
  activityEvents: await prisma.activityEvent.createMany({
    data: events.keep.map(revive),
    skipDuplicates: true,
  }),
  loginAttempts: await prisma.loginAttempt.createMany({
    data: data.loginAttempts.map(revive),
    skipDuplicates: true,
  }),
};

for (const [table, r] of Object.entries(results)) {
  console.log(`${table.padEnd(16)} inserted ${r.count}`);
}
console.log(
  `\nverify: diagnostics=${await prisma.diagnostic.count()} notes=${await prisma.note.count()} ` +
    `events=${await prisma.activityEvent.count()} attempts=${await prisma.loginAttempt.count()}`
);
await prisma.$disconnect();
