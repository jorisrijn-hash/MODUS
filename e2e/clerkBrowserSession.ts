import { expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

/**
 * Signing in through a REAL browser session, using the strategy this
 * instance actually supports.
 *
 * `clerk.signIn({ strategy: "password" })` silently left the session
 * null. The cause was not the username requirement: the instance's own
 * environment reports
 *
 *   password.used_for_first_factor = false,  first_factors = []
 *   email_address.used_for_first_factor = true, verifications = ["email_code"]
 *
 * so password is not a first factor here at all and the helper had no
 * supported strategy to use. The only first factor is an email code.
 *
 * The instance is in test mode, so a Clerk test address
 * (`…+clerk_test@example.com`) accepts the fixed code below without a
 * mailbox. This drives Clerk's own client through the real flow —
 * `signIn.create` → `prepareFirstFactor` → `attemptFirstFactor` →
 * `setActive` — so the browser ends up with genuine Clerk session
 * cookies, which is what a Bearer-header request can never demonstrate.
 */

export const CLERK_TEST_CODE = "424242";

export function testAccounts(): Record<string, string> | null {
  const env: Record<string, string> = {};
  for (const file of [".env.test.local", ".env.local", ".env"]) {
    try {
      for (const line of readFileSync(file, "utf8").split("\n")) {
        const m = line.match(/^([A-Z_0-9]+)=(.*)$/);
        if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    } catch {}
  }
  return env.MODUS_TEST_A_EMAIL && env.MODUS_TEST_B_EMAIL ? env : null;
}

async function clerkReady(page: Page) {
  await page.waitForFunction(() => Boolean((window as never as { Clerk?: { loaded?: boolean } }).Clerk?.loaded), {
    timeout: 20_000,
  });
}

/** Signs in for real and resolves once Clerk reports an active session. */
export async function signInAs(page: Page, email: string) {
  await clerkReady(page);
  const result = await page.evaluate(
    async ([identifier, code]) => {
      const Clerk = (window as never as { Clerk: any }).Clerk;
      try {
        if (Clerk.session) await Clerk.signOut();
        const signIn = await Clerk.client.signIn.create({ identifier });
        const factor = signIn.supportedFirstFactors?.find(
          (f: { strategy: string }) => f.strategy === "email_code"
        );
        if (!factor) {
          return { ok: false, why: `no email_code factor; got ${JSON.stringify(signIn.supportedFirstFactors)}` };
        }
        await signIn.prepareFirstFactor({ strategy: "email_code", emailAddressId: factor.emailAddressId });
        const attempt = await signIn.attemptFirstFactor({ strategy: "email_code", code });
        if (attempt.status !== "complete") return { ok: false, why: `status ${attempt.status}` };
        await Clerk.setActive({ session: attempt.createdSessionId });
        return { ok: true, userId: Clerk.user?.id ?? null };
      } catch (e) {
        return { ok: false, why: String(e).slice(0, 300) };
      }
    },
    [email, CLERK_TEST_CODE] as const
  );

  expect(result.ok, `sign-in failed: ${result.why ?? ""}`).toBe(true);
  // A session, in this browser, from Clerk's own client.
  await page.waitForFunction(() => Boolean((window as never as { Clerk?: { session?: unknown } }).Clerk?.session), {
    timeout: 15_000,
  });
  return result.userId as string | null;
}

export async function signOut(page: Page) {
  await clerkReady(page);
  await page.evaluate(async () => {
    await (window as never as { Clerk: any }).Clerk.signOut();
  });
  await page.waitForFunction(() => !(window as never as { Clerk?: { session?: unknown } }).Clerk?.session, {
    timeout: 15_000,
  });
}

export async function currentUserId(page: Page): Promise<string | null> {
  return page.evaluate(() => (window as never as { Clerk?: { user?: { id?: string } } }).Clerk?.user?.id ?? null);
}
