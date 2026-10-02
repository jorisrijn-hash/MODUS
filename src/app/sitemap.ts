import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/legal/site";

/**
 * Production sitemap at /sitemap.xml, via Next's supported mechanism.
 * There was no sitemap at all before this, which is why Search Console
 * reported a 404.
 *
 * ONLY public, canonical, indexable pages that return 200. Deliberately
 * excluded, and why:
 *
 *   /diagnostic   a personalised multi-step journey with saved drafts and
 *                 results — not a static landing page
 *   /app, /private  authenticated client and internal areas
 *   /proposal/*   tokenised, per-recipient URLs
 *   /api/*        endpoints, not pages
 *   /design-system, /motion-lab  internal development surfaces
 *
 * Exclusion here is a crawling hint, not a security control: those routes
 * are protected by their own authentication independently of this file.
 *
 * No `lastModified` is emitted. There is no reliable per-page content date
 * to draw from, and stamping every URL with "now" on each request is worse
 * than omitting the field — it tells crawlers everything changed every
 * time they look.
 */
const PUBLIC_PATHS = [
  "/",
  "/how-it-works",
  "/capabilities",
  "/platform",
  "/results",
  "/pricing",
  "/company",
  "/legal",
  "/privacypolicy",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map((path) => ({
    url: `${SITE_ORIGIN}${path}`,
    changeFrequency: path === "/" ? ("weekly" as const) : ("monthly" as const),
    priority: path === "/" ? 1 : 0.7,
  }));
}
