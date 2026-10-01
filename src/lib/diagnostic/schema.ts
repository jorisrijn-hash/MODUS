import { z } from "zod";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import type { Locale } from "@/lib/i18n/config";
import { en } from "@/lib/i18n/dictionaries/en";
import { nl } from "@/lib/i18n/dictionaries/nl";

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "yahoo.com",
  "live.com",
]);

// A representative set of well-known disposable/temporary email providers,
// not an exhaustive or actively-maintained feed (that would need a real
// subscription service). Good enough to catch the common cases without
// pretending to be authoritative.
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamailblock.com",
  "10minutemail.com",
  "tempmail.com",
  "temp-mail.org",
  "throwawaymail.com",
  "yopmail.com",
  "trashmail.com",
  "getnada.com",
  "dispostable.com",
  "fakeinbox.com",
  "sharklasers.com",
  "maildrop.cc",
  "mintemail.com",
  "mytemp.email",
  "tempinbox.com",
  "spamgourmet.com",
  "mailnesia.com",
  "moakt.com",
  "emailondeck.com",
  "33mail.com",
  "tempr.email",
  "mohmal.com",
  "tmpmail.org",
  "mailcatch.com",
  "discard.email",
  "spambog.com",
  "mail-temp.com",
]);

function isMostlyRepeatedChars(value: string) {
  const trimmed = value.trim();
  if (trimmed.length < 6) return false;
  const counts = new Map<string, number>();
  for (const ch of trimmed) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  const max = Math.max(...counts.values());
  return max / trimmed.length > 0.6;
}

export const companyNameSchema = z
  .string()
  .trim()
  .min(2, "Enter your company name.")
  .max(80, "Keep this under 80 characters.")
  .refine((v) => /[a-zA-Z0-9]/.test(v), "Enter a valid company name.");

export function normalizeWebsite(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export const websiteSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (v) => {
      if (!v) return true;
      try {
        const url = new URL(normalizeWebsite(v));
        return url.hostname.includes(".");
      } catch {
        return false;
      }
    },
    { message: "Enter a valid website address." }
  );

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Enter at least 2 characters.")
  .max(60, "Keep this under 60 characters.")
  .refine((v) => !/https?:\/\/|@/.test(v), "This doesn't look like a name.")
  .refine((v) => !isMostlyRepeatedChars(v), "Enter a valid name.")
  .refine((v) => /^[\p{L}\p{M}' -]+$/u.test(v), "Use letters, spaces, hyphens or apostrophes only.");

export const shortTextSchema = (max: number) =>
  z.string().trim().max(max, `Keep this under ${max} characters.`);

export const roleSchema = z.string().trim().max(80, "Keep this under 80 characters.");

export const textareaSchema = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, `Add a little more detail (at least ${min} characters).`)
    .max(max, `Keep this under ${max} characters.`)
    .refine((v) => !isMostlyRepeatedChars(v), "Tell us a bit more, in your own words.");

// Deliberately not relying on zod's built-in email validator (loose, version
// dependent): this pattern rejects the malformed cases explicitly called
// out in the brief (missing local/domain parts, spaces, double dots,
// impossible TLDs) without being so strict it rejects real addresses.
const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "Enter a shorter email address.")
  .refine((v) => !v.includes(" "), "Email addresses can't contain spaces.")
  .refine((v) => !v.includes(".."), "Enter a valid email address.")
  .refine((v) => EMAIL_PATTERN.test(v), "Enter a valid email address.");

export function emailDomain(email: string): string | null {
  const parts = email.split("@");
  return parts.length === 2 ? parts[1] : null;
}

export function isFreeEmailDomain(email: string): boolean {
  const domain = emailDomain(email);
  return domain ? FREE_EMAIL_DOMAINS.has(domain) : false;
}

export function isDisposableEmailDomain(email: string): boolean {
  const domain = emailDomain(email);
  return domain ? DISPOSABLE_EMAIL_DOMAINS.has(domain) : false;
}

export function validatePhone(raw: string, defaultCountry: "NL" | "US" | "GB" = "NL") {
  const trimmed = raw.trim();
  if (!trimmed) return { valid: true, e164: "", formatted: "" };
  const parsed = parsePhoneNumberFromString(trimmed, defaultCountry);
  if (!parsed || !parsed.isValid()) {
    return { valid: false, e164: "", formatted: "" };
  }
  return { valid: true, e164: parsed.number, formatted: parsed.formatInternational() };
}

// The schemas above always produce their default English `.message` text
// (their pass/fail behavior must stay identical regardless of locale, and
// several components gate on `.safeParse(...).success` without ever reading
// the message). This translates that fixed English message into the
// visitor's language for on-screen display, without touching the schemas
// themselves. Content lives in the locale dictionaries, same as elsewhere.
const STATIC_VALIDATION_KEYS = [
  "companyNameRequired",
  "companyNameTooLong",
  "companyNameInvalid",
  "websiteInvalid",
  "nameTooShort",
  "nameTooLong",
  "nameLooksLikeUrl",
  "nameInvalid",
  "nameInvalidChars",
  "emailTooLong",
  "emailNoSpaces",
  "emailInvalid",
  "textareaRepetitive",
] as const;

export function translateValidationMessage(
  message: string,
  locale: Locale,
  params?: { min?: number; max?: number }
): string {
  if (locale !== "nl") return message;

  for (const key of STATIC_VALIDATION_KEYS) {
    if (en.diagnosticValidation[key] === message) return nl.diagnosticValidation[key];
  }
  if (params?.max !== undefined && message === en.diagnosticValidation.textareaTooLong(params.max)) {
    return nl.diagnosticValidation.textareaTooLong(params.max);
  }
  if (params?.min !== undefined && message === en.diagnosticValidation.textareaTooShort(params.min)) {
    return nl.diagnosticValidation.textareaTooShort(params.min);
  }
  return message;
}
