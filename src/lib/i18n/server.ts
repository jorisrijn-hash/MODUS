import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./config";

/**
 * Server-side initial locale. Reads the manual-preference cookie only.
 * Never derives the rendered locale from Accept-Language: MODUS always
 * renders English by default and only switches on an explicit choice
 * (manual switch, or the one-time NL-detected prompt), which is what
 * sets this cookie.
 */
export async function getInitialLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
