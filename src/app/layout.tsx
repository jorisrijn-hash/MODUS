import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif } from "next/font/google";
import { MotionProvider } from "@/components/MotionProvider";
import { LocaleProvider } from "@/lib/i18n/context";
import { getInitialLocale } from "@/lib/i18n/server";
import { siteMetadata } from "@/lib/i18n/metadata";
import { ThemeProvider } from "@/lib/theme/context";
import { getInitialTheme } from "@/lib/theme/server";
import { OverlayProvider } from "@/components/system/OverlayProvider";
import { SystemNotificationHost } from "@/components/system/SystemNotificationHost";
import { ConsentBanner } from "@/components/privacy/ConsentBanner";
import { SITE_ORIGIN } from "@/lib/legal/site";
import "./globals.css";

// Checkpoint 3 note: Chatbot, LanguagePrompt, and Loader used to mount
// here too. All three are now mounted only inside
// src/app/(marketing)/layout.tsx instead — this is the fix for the
// pre-existing "leak" MODUS_REDESIGN_PLAN.md's Checkpoint 0 audit found
// (none of the four root overlays excluded /app, only /private, via a
// pathname check that was easy to forget on the next new provider).
// Moving them into the marketing route group makes it structurally
// impossible for them to reach /app or /private, rather than adding a
// fifth pathname check that could be forgotten again. ConsentBanner is
// the one that legitimately stays global — see its own note below.

// Display face. The reference uses Signifier; no licensed Signifier asset
// is supplied in this repository, and the reference's own public font file
// is a trial build whose public availability grants no redistribution
// right. Noto Serif is the mandate's named fallback and is what actually
// loads here — this is a documented substitution, not Signifier.
//
// 400 is the display weight (the reference's hero is weight 400); 500 is
// carried for the diagram headings that need a touch more presence at
// small optical sizes.
const serif = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500"],
});

// Supporting type, per the mandate: Geist and a suitable monospace face.
// Replaces Inter / IBM Plex Mono.
const sans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

// Was the placeholder "https://modus.example.com", which shipped to
// production: every page advertised a canonical URL and og:url on a domain
// that does not exist. Now the single canonical origin, shared with the
// sitemap and robots.txt so the three can never disagree.
const siteUrl = SITE_ORIGIN;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getInitialLocale();
  const { title, description } = siteMetadata[locale];

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    keywords: [
      "business optimization company",
      "business process optimization",
      "business automation services",
      "AI automation for business",
      "business systems optimization",
      "operational efficiency consulting",
      "workflow automation",
      "continuous business improvement",
    ],
    alternates: {
      canonical: siteUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: "website",
      url: siteUrl,
      siteName: "MODUS",
      title,
      description,
      locale: locale === "nl" ? "nl_NL" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    icons: {
      icon: "/favicon.svg",
    },
  };
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "MODUS",
  description:
    "MODUS provides improvement infrastructure for growing businesses, combining intelligence, technology and implementation to continuously improve how they operate.",
  url: siteUrl,
  areaServed: "Worldwide",
  serviceType: [
    "Business process optimization",
    "Business automation",
    "Operational efficiency consulting",
    "AI automation",
    "Business systems integration",
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialLocale = await getInitialLocale();
  const initialTheme = await getInitialTheme();

  return (
    <html
      lang={initialLocale}
      data-theme={initialTheme}
      className={`${serif.variable} ${sans.variable} ${mono.variable}`}
    >
      <body>
        {/*
         * Deliberately OUTSIDE <ClerkProvider>, as a direct child of
         * <body>.
         *
         * `clerk init` moved this inside it. ClerkProvider is a client
         * component, and React does not execute a <script> encountered
         * while rendering on the client — it warns instead:
         * "Encountered a script tag while rendering React component."
         * Keeping it in the Server Component's own output means it ships
         * in the SSR HTML, where crawlers actually read it.
         */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ClerkProvider>
          <ThemeProvider initialTheme={initialTheme}>
            <LocaleProvider initialLocale={initialLocale}>
              <OverlayProvider>
                <MotionProvider>
                  {children}
                  {/* Legitimately global, not marketing-only: cookies this
          consent decision governs (the modus_theme/modus_locale
          preference cookies, and any future analytics/marketing
          cookie) are set site-wide, including on /app — a
          visitor of the client dashboard is still a visitor
          whose consent matters, unlike /private (internal-only,
          no external visitor ever reaches it), which this
          component already excludes via its own pathname check.
          Kept inside MotionProvider like before this checkpoint
          so its own motion/react usage is unaffected. */}
                  <ConsentBanner />
                </MotionProvider>
                <SystemNotificationHost />
              </OverlayProvider>
            </LocaleProvider>
          </ThemeProvider>
          <div className="grain-overlay" aria-hidden />
        </ClerkProvider>
      </body>
    </html>
  );
}
