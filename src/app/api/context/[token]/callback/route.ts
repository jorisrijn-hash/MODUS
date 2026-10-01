import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

// Public, unauthenticated, by design — same trust model as
// GET /api/context/[token]: the token itself is the access control.
// This lets a visitor who has already completed a Diagnostic ask for a
// callback without inventing a login. Never trusts client-sent contact
// info — name/email/phone already live on the Diagnostic row itself.
const bodySchema = z.object({
  note: z.string().trim().max(500).optional().default(""),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const diagnostic = await prisma.diagnostic.findUnique({
    where: { contextToken: token },
    select: { id: true },
  });
  if (!diagnostic) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  // Idempotent-ish guard against a double click / flaky network retry —
  // not a security control, the token already is one.
  const since = new Date(Date.now() - 60 * 1000);
  const recent = await prisma.activityEvent.findFirst({
    where: { diagnosticId: diagnostic.id, label: { startsWith: "Callback requested" }, createdAt: { gte: since } },
  });
  if (recent) {
    return NextResponse.json({ ok: true });
  }

  await prisma.activityEvent.create({
    data: { diagnosticId: diagnostic.id, label: "Callback requested via website" },
  });

  if (parsed.data.note) {
    await prisma.note.create({
      data: { diagnosticId: diagnostic.id, author: "Visitor (callback request)", body: parsed.data.note },
    });
  }

  return NextResponse.json({ ok: true });
}
