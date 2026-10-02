/**
 * Exports every row from the current SQLite database to JSON.
 *
 * Run this BEFORE switching the Prisma datasource to Postgres. It is
 * read-only: it never writes to or deletes from the source database.
 * The output is the non-destructive migration path for real submissions
 * that already exist — fixtures must never overwrite them.
 */
import { PrismaClient } from "@prisma/client";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const out = process.argv[2] || "prisma/export/sqlite-export.json";
const prisma = new PrismaClient();

const data = {
  exportedAt: new Date().toISOString(),
  diagnostics: await prisma.diagnostic.findMany({ orderBy: { createdAt: "asc" } }),
  notes: await prisma.note.findMany({ orderBy: { createdAt: "asc" } }),
  activityEvents: await prisma.activityEvent.findMany({ orderBy: { createdAt: "asc" } }),
  loginAttempts: await prisma.loginAttempt.findMany({ orderBy: { createdAt: "asc" } }),
};

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(data, null, 2));

console.log(
  `exported -> ${out}\n` +
    `  diagnostics:    ${data.diagnostics.length}\n` +
    `  notes:          ${data.notes.length}\n` +
    `  activityEvents: ${data.activityEvents.length}\n` +
    `  loginAttempts:  ${data.loginAttempts.length}`
);
await prisma.$disconnect();
