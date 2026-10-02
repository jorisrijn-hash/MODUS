import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase clients for the native Clerk third-party auth integration.
 *
 * The Clerk SESSION token is passed straight through via `accessToken`.
 * This is the supported mechanism and it replaces the deprecated
 * JWT-template approach — there is no Clerk JWT template in this project,
 * and none should be created.
 *
 * Supabase verifies the token against Clerk's JWKS at
 * https://<frontend-api>/.well-known/jwks.json, which is why the Clerk
 * domain has to be registered under Supabase → Authentication →
 * Third-party Auth. `auth.jwt() ->> 'sub'` then resolves to the Clerk user
 * id, which is exactly what the RLS policies compare against.
 *
 * Every query made through these clients runs as the signed-in user and is
 * constrained by RLS. There is deliberately no service-role client here:
 * that key bypasses RLS entirely, and the server already reaches the
 * database through Prisma after doing its own explicit authorization.
 */

function requireConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * A client that carries the caller's Clerk session token.
 *
 * `accessToken` is a callback, not a captured string: Clerk rotates short
 * lived session tokens, and a client holding one from mount would start
 * failing a minute later.
 */
export function createClerkSupabaseClient(getToken: () => Promise<string | null>): SupabaseClient {
  const { url, anonKey } = requireConfig();
  return createClient(url, anonKey, {
    accessToken: async () => (await getToken()) ?? "",
  });
}

/**
 * An anonymous client, carrying no identity at all.
 *
 * Used to PROVE unauthenticated rejection rather than assume it: every
 * protected table must refuse this client.
 */
export function createAnonSupabaseClient(): SupabaseClient {
  const { url, anonKey } = requireConfig();
  return createClient(url, anonKey);
}
