import { NextResponse, type NextRequest } from "next/server";
import { dispatchPending } from "@/lib/notifications/outbox";

/**
 * Drains the notification outbox.
 *
 * Until this existed nothing drained it: submissions enqueued rows that
 * would have sat PENDING forever, so a lead could be saved and nobody
 * would ever be told.
 *
 * Scheduled by Vercel Cron (see vercel.json). Vercel sends
 * `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is configured.
 *
 * Deliberately never statically rendered or cached: it must execute per
 * invocation, and a cached response would silently stop delivery.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  // With no secret configured, accept only Vercel's own cron invocation.
  // A public, unauthenticated drain endpoint would let anyone force mail
  // sending and burn the provider quota.
  if (!secret) return request.headers.get("x-vercel-cron") !== null;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const result = await dispatchPending();
    // Counts only — never the recipients, the subjects or the bodies.
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[cron/notifications] dispatch failed", error);
    // 500 so the platform records the failure and retries on the next
    // tick. Rows stay PENDING with their backoff intact; nothing is lost.
    return NextResponse.json({ error: "Dispatch failed." }, { status: 500 });
  }
}
