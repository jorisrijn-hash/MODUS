import type { Locale } from "./config";

export const siteMetadata: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "MODUS | Business Optimization & Improvement Infrastructure",
    description:
      "MODUS continuously finds and fixes inefficiencies across operations, technology, data, automation and customer experience. Business improvement, implemented.",
  },
  nl: {
    title: "MODUS | Bedrijfsoptimalisatie & Verbeterinfrastructuur",
    description:
      "MODUS spoort continu inefficiënties op in operations, technologie, data, automatisering en klantervaring, en pakt ze aan. Bedrijfsverbetering, uitgevoerd.",
  },
};
