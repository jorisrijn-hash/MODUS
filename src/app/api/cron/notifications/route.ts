import { NextResponse, type NextRequest } from "next/server";
import { dispatchPending } from "@/lib/notifications/outbox";

/**
 * Daily retry sweep for the notification outbox.
 *
 * This is NOT the primary delivery path. Normal delivery happens promptly:
 * the submission route schedules a drain immediately after the record is
 * committed. This endpoint catches whatever failed then — a provider
 * outage, a cold-start timeout — and runs once a day, which is the maximum
 * frequency Vercel's Hobby plan supports. A quarter-hourly schedule would
 * have been rejected there.
 *
 * It is equally callable from any external scheduler that can send the
 * bearer token, if sub-daily retries are wanted without changing plan.
 *
 * Never statically rendered or cached: it must execute per invocation, and
 * a cached response would silently stop delivery.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * A SECRET is required. Nothing else authenticates this endpoint.
 *
 * An earlier version fell back to accepting any request carrying an
 * `x-vercel-cron` header when no secret was set. That is not
 * authentication — a header is attacker-controlled, so anyone could have
 * forced mail sending and burned the provider quota.
 *
 * With no CRON_SECRET configured this rejects EVERYTHING, including the
 * platform's own invocation. A deployment that forgets the secret stops
 * sending; it does not become public.
 */
function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = request.headers.get("authorization");
  if (!header) return false;

  const expected = `Bearer ${secret}`;
  // Constant-time compare, so response timing cannot be used to recover
  // the secret character by character.
  if (header.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= header.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const result = await dispatchPending();
    // Counts only — never recipients, subjects or bodies.
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[cron/notifications] dispatch failed", error);
    // 500 so the platform records the failure and retries on the next
    // tick. Rows stay PENDING with their backoff intact; nothing is lost.
    return NextResponse.json({ error: "Dispatch failed." }, { status: 500 });
  }
}
