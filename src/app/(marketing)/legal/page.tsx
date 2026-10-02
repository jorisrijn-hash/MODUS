import type { Metadata } from "next";
import { LegalPage, Mail, type LegalSection } from "@/components/legal/LegalPage";
import { CONTACT, LEGAL_UPDATED, SITE_ORIGIN } from "@/lib/legal/site";

export const metadata: Metadata = {
  title: "Legal Notice & Website Terms — MODUS",
  description:
    "Terms governing use of the MODUS website, the Free Diagnostic, accounts, intellectual property and liability.",
  alternates: { canonical: `${SITE_ORIGIN}/legal` },
};

/**
 * Content is the supplied legal.pdf, transcribed with the user's approved
 * 2 October 2026 contact substitution: the original Gmail address is
 * replaced by the confirmed aliases. Wording is otherwise unchanged.
 */
const sections: LegalSection[] = [
  {
    id: "about",
    heading: "About MODUS",
    body: (
      <>
        <p>
          MODUS helps businesses identify and implement improvements across areas such as websites,
          processes, systems, automation, analytics and growth.
        </p>
        <p>
          Information presented on this website is intended to explain MODUS, its approach and its
          services. Website content does not by itself create a client relationship or binding
          agreement.
        </p>
        <p>
          A separate proposal, service agreement or other written agreement may apply when you
          become a MODUS client.
        </p>
      </>
    ),
  },
  {
    id: "free-diagnostic",
    heading: "Free Diagnostic",
    body: (
      <>
        <p>MODUS may provide a Free Diagnostic through the website.</p>
        <p>
          The Diagnostic is intended to help identify potential areas for improvement within a
          business.
        </p>
        <p>Completing a Diagnostic:</p>
        <ul>
          <li>does not obligate you to purchase MODUS services;</li>
          <li>does not automatically create a client relationship;</li>
          <li>
            does not guarantee that MODUS will recommend or provide any particular service;
          </li>
          <li>does not guarantee a particular commercial result.</li>
        </ul>
        <p>
          Diagnostic output is based on the information provided and should be treated as general
          business guidance rather than legal, financial, tax or accounting advice.
        </p>
      </>
    ),
  },
  {
    id: "accounts",
    heading: "Accounts",
    body: (
      <>
        <p>MODUS may allow visitors to create a free account.</p>
        <p>An account may be used to save information such as:</p>
        <ul>
          <li>profile details;</li>
          <li>business information;</li>
          <li>diagnostic progress;</li>
          <li>completed diagnostics;</li>
          <li>preferences;</li>
          <li>saved recommendations.</li>
        </ul>
        <p>
          A free account does <strong>not</strong> automatically provide access to the MODUS client
          platform or other paid services.
        </p>
        <p>Client access may be granted separately by MODUS.</p>
        <p>
          You are responsible for maintaining the confidentiality of your account credentials and
          for activity carried out through your account.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    heading: "Intellectual Property",
    body: (
      <>
        <p>
          Unless otherwise stated, the MODUS website and its original content are owned by or
          licensed to MODUS.
        </p>
        <p>This includes, where applicable:</p>
        <ul>
          <li>branding;</li>
          <li>trademarks and logos;</li>
          <li>written content;</li>
          <li>interface designs;</li>
          <li>graphics;</li>
          <li>illustrations;</li>
          <li>animations;</li>
          <li>software;</li>
          <li>code;</li>
          <li>reports;</li>
          <li>diagnostic materials;</li>
          <li>methodologies.</li>
        </ul>
        <p>You may use the website for its intended purpose.</p>
        <p>
          You may not reproduce, distribute, sell, publish, commercially exploit or substantially
          modify MODUS materials without prior permission, except where applicable law permits this.
        </p>
        <p>Third-party trademarks and materials remain the property of their respective owners.</p>
      </>
    ),
  },
  {
    id: "accuracy",
    heading: "Accuracy of Information",
    body: (
      <>
        <p>MODUS aims to provide accurate and current information.</p>
        <p>
          However, website content may change and MODUS does not guarantee that every piece of
          information will always be complete, current or error-free.
        </p>
        <p>Prices, features, service descriptions and availability may change.</p>
        <p>
          Where information on the website conflicts with a signed client agreement, the signed
          agreement takes precedence.
        </p>
      </>
    ),
  },
  {
    id: "results",
    heading: "Results and Business Outcomes",
    body: (
      <>
        <p>
          Examples of improvements, recommendations, calculations, case studies or potential results
          are provided for informational purposes.
        </p>
        <p>Actual outcomes depend on factors including:</p>
        <ul>
          <li>the business;</li>
          <li>market conditions;</li>
          <li>implementation;</li>
          <li>customer behaviour;</li>
          <li>third-party platforms;</li>
          <li>budgets;</li>
          <li>data quality;</li>
          <li>external events.</li>
        </ul>
        <p>
          MODUS does not guarantee specific revenue, conversion, traffic, cost-saving or other
          business results unless expressly agreed in writing.
        </p>
      </>
    ),
  },
  {
    id: "third-party",
    heading: "Third-Party Services",
    body: (
      <>
        <p>MODUS may use or integrate third-party technologies and platforms.</p>
        <p>The website may also contain links to third-party websites.</p>
        <p>
          MODUS does not control the availability, security, content or policies of independent
          third parties.
        </p>
        <p>Your use of third-party products or services may also be subject to their own terms.</p>
      </>
    ),
  },
  {
    id: "availability",
    heading: "Website Availability",
    body: (
      <>
        <p>MODUS aims to keep the website available and secure.</p>
        <p>However, access may occasionally be interrupted due to:</p>
        <ul>
          <li>maintenance;</li>
          <li>updates;</li>
          <li>hosting issues;</li>
          <li>technical errors;</li>
          <li>third-party outages;</li>
          <li>security incidents;</li>
          <li>circumstances outside MODUS&rsquo;s reasonable control.</li>
        </ul>
        <p>MODUS does not guarantee uninterrupted website availability.</p>
      </>
    ),
  },
  {
    id: "liability",
    heading: "Liability",
    body: (
      <>
        <p>
          Nothing in these terms excludes or limits liability where doing so would be prohibited by
          applicable law.
        </p>
        <p>
          To the extent permitted by law, MODUS is not responsible for indirect or consequential
          losses arising solely from:
        </p>
        <ul>
          <li>reliance on general website information;</li>
          <li>temporary website unavailability;</li>
          <li>third-party websites or services;</li>
          <li>information supplied incorrectly by a user.</li>
        </ul>
        <p>
          Any liability relating to paid client services may be governed separately by the
          applicable client agreement.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    heading: "Acceptable Use",
    body: (
      <>
        <p>You may not use the MODUS website to:</p>
        <ul>
          <li>interfere with its operation or security;</li>
          <li>attempt unauthorised access;</li>
          <li>distribute malicious software;</li>
          <li>scrape or extract information at an unreasonable scale;</li>
          <li>impersonate another person or organisation;</li>
          <li>submit unlawful or intentionally misleading material;</li>
          <li>use the service in violation of applicable law.</li>
        </ul>
        <p>
          MODUS may restrict access where necessary to protect the website, users or its systems.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    heading: "Changes",
    body: (
      <>
        <p>MODUS may update the website and these terms.</p>
        <p>
          The latest version will be published on this page together with the date it was last
          updated.
        </p>
      </>
    ),
  },
  {
    id: "governing-law",
    heading: "Governing Law",
    body: (
      <>
        <p>
          Unless mandatory law requires otherwise, these terms are governed by the laws of the
          Netherlands.
        </p>
        <p>
          Any dispute will be handled by the competent court in the Netherlands, subject to
          applicable statutory rights.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    heading: "Contact",
    body: (
      <>
        <p>For questions about these terms:</p>
        <p>
          <strong>MODUS</strong>
          <br />
          Joris van Rijn
          <br />
          2352DH, Leiderdorp
          <br />
          Netherlands
        </p>
        <ul>
          <li>
            General and legal enquiries: <Mail address={CONTACT.general} />
          </li>
          <li>
            Account and diagnostic support: <Mail address={CONTACT.support} />
          </li>
          <li>
            Direct contact — Joris van Rijn: <Mail address={CONTACT.direct} />
          </li>
        </ul>
      </>
    ),
  },
];

export default function Legal() {
  return (
    <LegalPage
      title="Legal Notice & Website Terms"
      updated={LEGAL_UPDATED}
      sections={sections}
      intro={
        <>
          <p>
            These terms govern your use of the MODUS website and the information, tools and services
            made available through it.
          </p>
          <p>
            MODUS is operated by Joris van Rijn, trading as <strong>MODUS</strong>, established in
            the Netherlands.
          </p>
          <p>
            <strong>Website:</strong> withmodus.co
            <br />
            <strong>Email:</strong> <Mail address={CONTACT.general} />
          </p>
        </>
      }
    />
  );
}
