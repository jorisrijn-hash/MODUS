/**
 * Grants or revokes MODUS administrator membership.
 *
 * Deliberately a human-invoked command, never automatic. There is no
 * "first signup becomes admin" and no email-domain rule: either is a
 * privilege-escalation path the moment someone can control the input.
 *
 *   node scripts/grant-admin.mjs user_2abc...
 *   node scripts/grant-admin.mjs --revoke user_2abc...
 *
 * The argument is a Clerk user id, found in Clerk → Users. No password or
 * secret is involved, so nothing here belongs in a file or in chat.
 */
import { PrismaClient } from "@prisma/client";

const args = process.argv.slice(2);
const revoke = args.includes("--revoke");
const userId = args.find((a) => !a.startsWith("--"));

if (!userId) {
  console.error("Usage: node scripts/grant-admin.mjs [--revoke] <clerk-user-id>");
  process.exit(1);
}

// Clerk subject ids are prefixed. Rejecting anything else catches the
// common mistake of passing an email address, which would silently create
// a membership row that can never match a real session.
if (!/^user_[A-Za-z0-9]+$/.test(userId)) {
  console.error(
    `"${userId}" is not a Clerk user id.\n` +
      `Expected something like user_2abc123... — find it in Clerk → Users.\n` +
      `An email address will not work: membership is matched on the token subject.`
  );
  process.exit(1);
}

const prisma = new PrismaClient();
const actor = process.env.USER || "unknown";

if (revoke) {
  const result = await prisma.adminMember.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  await prisma.auditEvent.create({
    data: { actorId: actor, action: "admin.revoked", subjectId: userId },
  });
  console.log(
    result.count
      ? `Revoked admin for ${userId}. The next protected action will fail — membership is\n` +
          `re-read from the database on every request, not trusted from a token claim.`
      : `${userId} held no active admin membership. Nothing changed.`
  );
} else {
  await prisma.adminMember.upsert({
    where: { userId },
    create: { userId, createdBy: actor },
    update: { revokedAt: null, createdBy: actor },
  });
  await prisma.auditEvent.create({
    data: { actorId: actor, action: "admin.granted", subjectId: userId },
  });
  console.log(
    `Granted MODUS admin to ${userId}.\n` +
      `Make sure MFA is enabled for this account in Clerk before using it.`
  );
}

await prisma.$disconnect();
