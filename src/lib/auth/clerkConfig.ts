/**
 * Is Clerk configured in this environment?
 *
 * Both keys are required: the publishable key alone renders a provider
 * that cannot verify anything, and the secret key alone cannot mount the
 * client.
 *
 * This exists so a missing provider configuration degrades instead of
 * taking the whole site down. Without it, `ClerkProvider` and
 * `clerkMiddleware()` throw at runtime and every page — including the
 * marketing pages and the guest diagnostic, which need no account at all —
 * returns 500. Verified directly: a production server with no Clerk keys
 * 500'd on `/` and `/diagnostic`.
 *
 * The degradation is deliberately ASYMMETRIC:
 *   public pages and the guest diagnostic  -> keep working
 *   anything requiring an identity          -> fails CLOSED
 *
 * Unconfigured therefore means "nobody is signed in and nobody can be",
 * never "skip the check". See `currentIdentity()` and
 * `requireAdminSession()`.
 */
export function isClerkConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
  );
}

/**
 * Client-side counterpart. Next inlines `NEXT_PUBLIC_*` at build time, so
 * this is readable in the browser; the secret key deliberately is not and
 * must never be referenced from client code.
 */
export function isClerkPubliclyConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}
