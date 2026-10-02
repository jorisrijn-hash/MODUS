import { clerkMiddleware } from "@clerk/nextjs/server";
import { isClerkConfigured } from "@/lib/auth/clerkConfig";

/**
 * Clerk middleware runs on every matched request to establish the session.
 *
 * It deliberately does NOT protect any route by itself. Authorization is
 * enforced where the data is — in the route handler, the server action and
 * the query — because each is independently reachable and a middleware
 * matcher is easy to leave a hole in. Middleware here resolves identity;
 * `requireAdmin()` in src/lib/auth/authorize.ts decides access.
 *
 * In particular the guest diagnostic flow stays open: /diagnostic and
 * POST /api/diagnostic require no account, exactly as before.
 */
// Only runs when Clerk is configured. `clerkMiddleware()` throws on every
// matched request without keys, which is one of the two reasons an
// unconfigured deployment returned 500 everywhere.
//
// Skipping it does NOT skip any authorization: with no middleware there is
// no session, so `auth()` yields no user and every protected surface fails
// closed. Public pages and the guest diagnostic, which never needed a
// session, carry on.
export default isClerkConfigured() ? clerkMiddleware() : () => undefined;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    // Clerk's auto-proxy path. Without it the handshake endpoints are not
    // matched and sign-in silently fails to complete.
    "/__clerk/:path*",
  ],
};
