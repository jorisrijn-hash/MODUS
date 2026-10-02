/**
 * Canonical public contacts and origin.
 *
 * The four aliases below are RECEIVING aliases the user has confirmed
 * forward correctly. They are not configured outbound mailboxes: nothing
 * here may be used as a transactional sender, SMTP identity or
 * authentication-email From address without separate provider
 * verification. The underlying Gmail forwarding destination is
 * deliberately never published.
 */
export const CONTACT = {
  general: "hello@withmodus.co",
  privacy: "privacy@withmodus.co",
  support: "support@withmodus.co",
  direct: "joris@withmodus.co",
} as const;

export const LEGAL_UPDATED = "2 October 2026";

/**
 * Canonical origin for sitemap and canonical tags.
 *
 * Determined from the live deployment, not from whatever host a request
 * happens to arrive on: `withmodus.co` issues a 308 to `www.withmodus.co`,
 * so www is canonical. Overridable per environment, because a preview
 * deployment must not advertise production URLs.
 */
export const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_ORIGIN?.replace(/\/$/, "") || "https://www.withmodus.co";
