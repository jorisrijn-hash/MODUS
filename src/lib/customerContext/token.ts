import { randomBytes } from "crypto";

/** A purpose-built public capability token — not the row's own id/cuid.
 * See the schema comment on Diagnostic.contextToken for why. */
export function generateContextToken(): string {
  return randomBytes(32).toString("base64url");
}
