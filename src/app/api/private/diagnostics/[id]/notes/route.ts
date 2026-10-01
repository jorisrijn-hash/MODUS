import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/requireAuth";

const noteSchema = z.object({
  body: z.string().trim().min(1, "Note can't be empty.").max(2000, "Keep this under 2000 characters."),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = noteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid note." }, { status: 400 });
  }

  const note = await prisma.note.create({
    data: { diagnosticId: id, body: parsed.data.body, author: "Admin" },
  });
  await prisma.activityEvent.create({
    data: { diagnosticId: id, label: "Internal note added" },
  });

  return NextResponse.json({ note });
}
