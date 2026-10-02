import { prisma } from "@/lib/db";

/**
 * Durable outbox for internal notification email.
 *
 * The ordering rule is the whole point: a submission is COMMITTED first,
 * then a row is enqueued here. Mail is never on the critical path of a
 * save. So a mail outage cannot lose a lead, cannot make a successful
 * submission report failure to the visitor, and cannot cause a duplicate
 * submission when the visitor retries.
 *
 * `dedupeKey` is unique, so a retry of the same event resolves to the same
 * outbox row rather than sending twice.
 */

/**
 * Where internal notifications go. Centralised server-side configuration —
 * NEVER taken from browser input, which would turn every form into an
 * open relay for whoever crafted the request.
 */
export const NOTIFICATION_RECIPIENT =
  process.env.FORM_NOTIFICATION_TO || "hello@withmodus.co";

const MAX_ATTEMPTS = 5;

/** Strips CR/LF so submitted content cannot inject extra mail headers. */
function headerSafe(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

export type SubmissionNotification = {
  diagnosticId: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  formType: string;
  submittedAt: Date;
  adminUrl: string;
};

/**
 * Builds the internal notification.
 *
 * Deliberately a SUMMARY plus a link, not the submission itself: full
 * diagnostic answers stay behind admin authentication rather than sitting
 * in an inbox and in every mail server along the way.
 */
export function buildSubmissionEmail(n: SubmissionNotification) {
  const subject = headerSafe(`New MODUS ${n.formType} — ${n.companyName}`);
  const body = [
    `A new ${n.formType} has been submitted and saved.`,
    ``,
    `Company:    ${n.companyName}`,
    `Contact:    ${n.contactName}`,
    `Email:      ${n.contactEmail}`,
    `Submitted:  ${n.submittedAt.toISOString()}`,
    `Reference:  ${n.diagnosticId}`,
    ``,
    `Open it in the admin inbox:`,
    n.adminUrl,
    ``,
    `The answers are not included here — they stay behind authentication.`,
  ].join("\n");
  return { subject, body };
}

/**
 * Enqueues a notification. Call this AFTER the submission is committed.
 *
 * Never throws into the request path: if enqueueing fails, the submission
 * is still saved and the visitor must still be told it succeeded, because
 * it did. The failure is logged for reconciliation instead.
 */
export async function enqueueSubmissionNotification(
  n: SubmissionNotification
): Promise<void> {
  const { subject, body } = buildSubmissionEmail(n);
  try {
    await prisma.notificationOutbox.create({
      data: {
        kind: "diagnostic.submitted",
        // One delivery per submission, no matter how many times the event
        // is replayed.
        dedupeKey: `diagnostic.submitted:${n.diagnosticId}`,
        recipient: NOTIFICATION_RECIPIENT,
        subject,
        body,
        nextAttemptAt: new Date(),
      },
    });
  } catch (error) {
    const known = error as { code?: string };
    // P2002 = unique violation on dedupeKey: already enqueued. That is the
    // mechanism working, not a problem.
    if (known.code !== "P2002") {
      console.error("[outbox] enqueue failed; submission is still saved", error);
    }
  }
}

/**
 * Delivers pending notifications.
 *
 * Intended to be driven by a scheduled invocation. Exponential backoff,
 * bounded attempts, and `status` moved to FAILED only after the bound is
 * reached so a permanently broken address stops being retried forever.
 */
export async function dispatchPending(limit = 20): Promise<{
  sent: number;
  failed: number;
  skipped: number;
}> {
  const { sendMail, isMailConfigured } = await import("./mailer");

  if (!isMailConfigured()) {
    // Explicit and loud rather than silently pretending to deliver.
    const pending = await prisma.notificationOutbox.count({ where: { status: "PENDING" } });
    console.warn(
      `[outbox] no mail provider configured; ${pending} notification(s) waiting. ` +
        `Set RESEND_API_KEY and MAIL_FROM to enable delivery.`
    );
    return { sent: 0, failed: 0, skipped: pending };
  }

  const due = await prisma.notificationOutbox.findMany({
    where: {
      status: "PENDING",
      OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: new Date() } }],
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  let sent = 0;
  let failed = 0;

  for (const row of due) {
    try {
      await sendMail({ to: row.recipient, subject: row.subject, text: row.body });
      await prisma.notificationOutbox.update({
        where: { id: row.id },
        data: { status: "SENT", sentAt: new Date(), attempts: row.attempts + 1, lastError: null },
      });
      sent++;
    } catch (error) {
      const attempts = row.attempts + 1;
      const exhausted = attempts >= MAX_ATTEMPTS;
      await prisma.notificationOutbox.update({
        where: { id: row.id },
        data: {
          attempts,
          status: exhausted ? "FAILED" : "PENDING",
          lastError: String(error).slice(0, 500),
          // 1m, 2m, 4m, 8m ...
          nextAttemptAt: exhausted ? null : new Date(Date.now() + 60_000 * 2 ** (attempts - 1)),
        },
      });
      failed++;
    }
  }

  return { sent, failed, skipped: 0 };
}
