import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/legal/site";

/**
 * /robots.txt, with an absolute Sitemap directive.
 *
 * Preview and non-production deployments are kept out of search entirely;
 * production allows crawling of public pages and disallows the
 * authenticated, tokenised and internal areas. `VERCEL_ENV` is set by the
 * platform, so a preview build cannot accidentally ship production rules
 * or vice versa.
 *
 * This is a crawling directive only. It is not access control, and it does
 * not substitute for noindex: a crawler must be able to fetch a page to
 * read a noindex directive at all.
 */
export default function robots(): MetadataRoute.Robots {
  const isProduction =
    process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "development";

  if (!isProduction) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/app/", "/private/", "/proposal/", "/design-system", "/motion-lab"],
    },
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}
