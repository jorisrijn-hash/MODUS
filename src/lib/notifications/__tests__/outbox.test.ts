import { describe, expect, it, vi, beforeEach } from "vitest";

/**
 * The outbox's durability guarantees, exercised against the real logic
 * with the database and the mail provider mocked.
 *
 * These are the properties that decide whether a lead can be lost, and
 * whether a retry can bill a customer's inbox twice.
 */

type Row = {
  id: string;
  dedupeKey: string;
  recipient: string;
  subject: string;
  body: string;
  status: string;
  attempts: number;
  lastError: string | null;
  sentAt: Date | null;
  nextAttemptAt: Date | null;
  createdAt: Date;
};

let rows: Row[] = [];

const prismaMock = {
  notificationOutbox: {
    create: vi.fn(async ({ data }: { data: Partial<Row> }) => {
      if (rows.some((r) => r.dedupeKey === data.dedupeKey)) {
        // Mirrors Postgres' unique violation on dedupeKey.
        throw Object.assign(new Error("Unique constraint failed"), { code: "P2002" });
      }
      const row = {
        id: `o${rows.length + 1}`,
        status: "PENDING",
        attempts: 0,
        lastError: null,
        sentAt: null,
        nextAttemptAt: new Date(),
        createdAt: new Date(),
        ...data,
      } as Row;
      rows.push(row);
      return row;
    }),
    findMany: vi.fn(async ({ take }: { take?: number } = {}) =>
      rows
        .filter(
          (r) =>
            r.status === "PENDING" && (!r.nextAttemptAt || r.nextAttemptAt.getTime() <= Date.now())
        )
        .slice(0, take ?? 50)
    ),
    update: vi.fn(async ({ where, data }: { where: { id: string }; data: Partial<Row> }) => {
      const row = rows.find((r) => r.id === where.id)!;
      Object.assign(row, data);
      return row;
    }),
    count: vi.fn(async () => rows.filter((r) => r.status === "PENDING").length),
  },
};

vi.mock("@/lib/db", () => ({ prisma: prismaMock }));

const sendMail = vi.fn();
const isMailConfigured = vi.fn(() => true);
vi.mock("../mailer", () => ({
  sendMail: (...a: unknown[]) => sendMail(...a),
  isMailConfigured: () => isMailConfigured(),
}));

const { enqueueSubmissionNotification, dispatchPending, buildSubmissionEmail } = await import(
  "../outbox"
);

const notification = {
  diagnosticId: "diag_1",
  companyName: "Acme BV",
  contactName: "Ada Lovelace",
  contactEmail: "ada@example.com",
  formType: "diagnostic submission",
  submittedAt: new Date("2026-10-02T12:00:00Z"),
  adminUrl: "https://www.withmodus.co/private/diagnostics/diag_1",
};

beforeEach(() => {
  rows = [];
  sendMail.mockReset();
  isMailConfigured.mockReturnValue(true);
});

describe("a mail failure never loses the record", () => {
  it("keeps the row PENDING and schedules a retry", async () => {
    await enqueueSubmissionNotification(notification);
    sendMail.mockRejectedValue(new Error("provider is down"));

    const result = await dispatchPending();

    expect(result).toMatchObject({ sent: 0, failed: 1 });
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe("PENDING");
    expect(rows[0].attempts).toBe(1);
    expect(rows[0].lastError).toContain("provider is down");
    // Backed off, so the next sweep does not hammer a provider that is down.
    expect(rows[0].nextAttemptAt!.getTime()).toBeGreaterThan(Date.now());
    expect(rows[0].sentAt).toBeNull();
  });

  it("backs off further with each attempt and gives up only after a bound", async () => {
    await enqueueSubmissionNotification(notification);
    sendMail.mockRejectedValue(new Error("still down"));

    const delays: number[] = [];
    for (let i = 0; i < 5; i++) {
      rows[0].nextAttemptAt = null; // make it due again
      await dispatchPending();
      if (rows[0].nextAttemptAt) delays.push(rows[0].nextAttemptAt.getTime() - Date.now());
    }

    expect(rows[0].attempts).toBe(5);
    // Only after the bound does it stop, so a permanently bad address is
    // not retried forever.
    expect(rows[0].status).toBe("FAILED");
    for (let i = 1; i < delays.length; i++) {
      expect(delays[i]).toBeGreaterThan(delays[i - 1]);
    }
  });

  it("does not throw into the request path when enqueueing fails", async () => {
    prismaMock.notificationOutbox.create.mockRejectedValueOnce(new Error("db unavailable"));
    // The submission is already committed at this point: this must never
    // turn a saved record into a reported failure.
    await expect(enqueueSubmissionNotification(notification)).resolves.toBeUndefined();
  });
});

describe("retries never deliver twice", () => {
  it("collapses a repeated event onto one row", async () => {
    await enqueueSubmissionNotification(notification);
    await enqueueSubmissionNotification(notification);
    await enqueueSubmissionNotification(notification);

    expect(rows).toHaveLength(1);
    expect(rows[0].dedupeKey).toBe("diagnostic.submitted:diag_1");
  });

  it("sends once, then stops considering the row", async () => {
    await enqueueSubmissionNotification(notification);
    sendMail.mockResolvedValue(undefined);

    const first = await dispatchPending();
    expect(first.sent).toBe(1);
    expect(rows[0].status).toBe("SENT");
    expect(rows[0].sentAt).toBeInstanceOf(Date);

    // A second sweep, a duplicate cron tick, a manual run — none may
    // re-send an already-delivered notification.
    const second = await dispatchPending();
    expect(second.sent).toBe(0);
    expect(sendMail).toHaveBeenCalledTimes(1);
  });

  it("re-enqueueing after a successful send does not resurrect it", async () => {
    await enqueueSubmissionNotification(notification);
    sendMail.mockResolvedValue(undefined);
    await dispatchPending();

    await enqueueSubmissionNotification(notification);
    await dispatchPending();

    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(rows).toHaveLength(1);
  });
});

describe("no provider configured", () => {
  it("reports the backlog and sends nothing, rather than pretending", async () => {
    await enqueueSubmissionNotification(notification);
    isMailConfigured.mockReturnValue(false);

    const result = await dispatchPending();

    expect(result).toEqual({ sent: 0, failed: 0, skipped: 1 });
    expect(sendMail).not.toHaveBeenCalled();
    expect(rows[0].status).toBe("PENDING");
  });
});

describe("the email itself", () => {
  it("summarises without leaking the submission", () => {
    const { subject, body } = buildSubmissionEmail(notification);
    expect(subject).toBe("New MODUS diagnostic submission — Acme BV");
    expect(body).toContain("diag_1");
    expect(body).toContain(notification.adminUrl);
    // Answers stay behind authentication, not in an inbox and every mail
    // server along the way.
    expect(body).toContain("not included here");
  });

  it("strips CR/LF so submitted content cannot inject mail headers", () => {
    const { subject } = buildSubmissionEmail({
      ...notification,
      companyName: "Acme\r\nBcc: attacker@evil.test",
    });
    expect(subject).not.toContain("\n");
    expect(subject).not.toContain("\r");
  });
});
