import type { Metadata } from "next";
import { LegalPage, Mail, type LegalSection } from "@/components/legal/LegalPage";
import { CONTACT, LEGAL_UPDATED, SITE_ORIGIN } from "@/lib/legal/site";

export const metadata: Metadata = {
  title: "Privacy Policy — MODUS",
  description:
    "What personal data MODUS may collect, why it is processed, how it is protected and what rights you have.",
  alternates: { canonical: `${SITE_ORIGIN}/privacypolicy` },
};

/**
 * Content is the supplied privacy.pdf with the user's approved
 * 2 October 2026 contact substitution.
 *
 * IMPORTANT — the source document carries editorial notes and unresolved
 * placeholders in sections 6, 7, 9, 11 and 14 ("Do not publish a provider
 * name here until it is actually being used", "[12/24 months ...]",
 * "Possible structure", "Claude should not invent these periods", "Only
 * include services actually used in production"). Those are instructions
 * to the author, not policy, and none of them appear on this page.
 *
 * Where a fact is genuinely unresolved, this page says so plainly rather
 * than inventing a retention period, a provider or a transfer safeguard.
 * Each gap is tracked in MODUS_POLICY_RESOLUTION.md as a release blocker
 * for the final policy.
 */
const sections: LegalSection[] = [
  {
    id: "information-we-collect",
    heading: "Information We May Collect",
    body: (
      <>
        <p>Depending on how you use MODUS, we may process:</p>
        <h3>Contact information</h3>
        <ul>
          <li>name;</li>
          <li>email address;</li>
          <li>telephone number;</li>
          <li>company name;</li>
          <li>job or role information.</li>
        </ul>
        <h3>Business information</h3>
        <ul>
          <li>information about your organisation;</li>
          <li>business objectives;</li>
          <li>processes;</li>
          <li>systems;</li>
          <li>website;</li>
          <li>marketing;</li>
          <li>operational challenges.</li>
        </ul>
        <h3>Diagnostic information</h3>
        <ul>
          <li>diagnostic answers;</li>
          <li>progress;</li>
          <li>submitted information;</li>
          <li>results;</li>
          <li>recommendations associated with your submission.</li>
        </ul>
        <h3>Account information</h3>
        <ul>
          <li>account identifier;</li>
          <li>profile information;</li>
          <li>saved preferences;</li>
          <li>saved diagnostics;</li>
          <li>authentication-related information.</li>
        </ul>
        <h3>Technical information</h3>
        <ul>
          <li>IP address;</li>
          <li>browser type;</li>
          <li>device information;</li>
          <li>operating system;</li>
          <li>approximate location derived from IP;</li>
          <li>pages visited;</li>
          <li>referral information;</li>
          <li>timestamps;</li>
          <li>consent preferences.</li>
        </ul>
      </>
    ),
  },
  {
    id: "why-we-process",
    heading: "Why We Process Personal Data",
    body: (
      <>
        <p>We may process personal data to:</p>
        <ul>
          <li>provide the MODUS website;</li>
          <li>operate user accounts;</li>
          <li>save user preferences;</li>
          <li>save and resume diagnostics;</li>
          <li>respond to enquiries;</li>
          <li>provide diagnostic feedback;</li>
          <li>prepare proposals;</li>
          <li>communicate with potential clients;</li>
          <li>provide contracted services;</li>
          <li>maintain security;</li>
          <li>prevent abuse;</li>
          <li>analyse and improve website performance;</li>
          <li>comply with legal obligations.</li>
        </ul>
      </>
    ),
  },
  {
    id: "legal-bases",
    heading: "Legal Bases",
    body: (
      <>
        <p>Depending on the processing activity, MODUS may rely on:</p>
        <h3>Contract or pre-contractual steps</h3>
        <p>For example, where you request information, a proposal or services.</p>
        <h3>Consent</h3>
        <p>For example, where consent is required for certain cookies or communications.</p>
        <h3>Legitimate interests</h3>
        <p>
          For example, operating and securing the website, responding to genuine business enquiries
          or improving MODUS services.
        </p>
        <h3>Legal obligations</h3>
        <p>Where MODUS is required to retain or disclose information under applicable law.</p>
        <p>Where processing is based on consent, you may withdraw that consent.</p>
      </>
    ),
  },
  {
    id: "free-diagnostic",
    heading: "Free Diagnostic",
    body: (
      <>
        <p>The MODUS Free Diagnostic allows you to provide information about your business.</p>
        <p>We may process this information to:</p>
        <ul>
          <li>understand your business situation;</li>
          <li>generate or prepare diagnostic feedback;</li>
          <li>identify potential areas for improvement;</li>
          <li>contact you about your submission;</li>
          <li>prepare relevant recommendations;</li>
          <li>discuss MODUS services where appropriate.</li>
        </ul>
        <p>You may complete the Diagnostic without automatically becoming a paid client.</p>
        <p>
          If you have a MODUS account, supported Diagnostic information may be linked to that
          account so you can save or resume it.
        </p>
      </>
    ),
  },
  {
    id: "user-accounts",
    heading: "User Accounts",
    body: (
      <>
        <p>MODUS may offer free user accounts.</p>
        <p>Your account may allow you to store:</p>
        <ul>
          <li>personal details;</li>
          <li>company information;</li>
          <li>diagnostic history;</li>
          <li>saved recommendations;</li>
          <li>preferences.</li>
        </ul>
        <p>
          Creating an account does not automatically provide access to the MODUS client software.
        </p>
        <p>Authentication and permission to access client-only areas are separate.</p>
        <p>
          If MODUS later grants client access to your existing account, you should not need to
          create a second identity.
        </p>
      </>
    ),
  },
  {
    id: "authentication-providers",
    heading: "Authentication Providers",
    body: (
      <>
        <p>
          MODUS may use a specialist authentication provider to manage account creation, login,
          verification and sessions.
        </p>
        <p>
          The account system is not yet publicly available. The provider actually used in production
          will be named in this section before accounts are launched.
        </p>
      </>
    ),
  },
  {
    id: "data-storage",
    heading: "Data Storage and Infrastructure",
    body: (
      <>
        <p>MODUS may use third-party infrastructure providers for:</p>
        <ul>
          <li>hosting;</li>
          <li>databases;</li>
          <li>authentication;</li>
          <li>analytics;</li>
          <li>communications;</li>
          <li>security;</li>
          <li>deployment.</li>
        </ul>
        <p>
          This website is hosted and deployed on <strong>Vercel</strong>. Providers used for the
          remaining categories will be named here as they enter production use.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    heading: "Cookies and Similar Technologies",
    body: (
      <>
        <p>MODUS may use cookies or similar technologies.</p>
        <p>These may include:</p>
        <h3>Necessary cookies</h3>
        <p>Used for functions such as:</p>
        <ul>
          <li>authentication;</li>
          <li>security;</li>
          <li>language preferences;</li>
          <li>theme preferences;</li>
          <li>cookie consent.</li>
        </ul>
        <h3>Analytics</h3>
        <p>Used to understand website usage and performance.</p>
        <h3>Marketing or tracking technologies</h3>
        <p>If introduced, these will only be used where required consent has been obtained.</p>
        <p>Non-essential tracking is not activated before the required consent is given.</p>
        <p>
          You can update your preferences at any time through the website&rsquo;s{" "}
          <strong>Cookie Settings</strong>.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    heading: "Data Retention",
    body: (
      <>
        <p>
          MODUS keeps personal data only for as long as necessary for the relevant purpose or where
          retention is legally required.
        </p>
        <ul>
          <li>
            <strong>Client information:</strong> for the duration of the client relationship plus
            any applicable contractual or legal retention period.
          </li>
          <li>
            <strong>Financial administration:</strong> retained where required under Dutch
            accounting and tax obligations.
          </li>
        </ul>
        <p>
          Specific retention periods for diagnostic, enquiry and account information are being
          finalised and will be published in this section before the account system is launched.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    heading: "Sharing Personal Data",
    body: (
      <>
        <p>MODUS does not sell personal data.</p>
        <p>We may share information with service providers where necessary to operate MODUS.</p>
        <p>
          Providers should only receive information necessary for the relevant purpose and should be
          subject to appropriate privacy and security obligations.
        </p>
        <p>
          We may also disclose information where required by law or where reasonably necessary to
          protect legal rights or security.
        </p>
      </>
    ),
  },
  {
    id: "international-transfers",
    heading: "International Transfers",
    body: (
      <>
        <p>
          Some technology providers may process data outside the Netherlands or European Economic
          Area.
        </p>
        <p>
          Where applicable, MODUS will use an appropriate legal mechanism for international
          transfers. This may include:
        </p>
        <ul>
          <li>adequacy decisions;</li>
          <li>Standard Contractual Clauses;</li>
          <li>another legally recognised safeguard.</li>
        </ul>
      </>
    ),
  },
  {
    id: "security",
    heading: "Security",
    body: (
      <>
        <p>
          MODUS takes reasonable technical and organisational measures intended to protect personal
          data.
        </p>
        <p>Measures may include:</p>
        <ul>
          <li>access controls;</li>
          <li>encrypted connections;</li>
          <li>authentication;</li>
          <li>database access policies;</li>
          <li>secure hosting;</li>
          <li>restricted administrative access;</li>
          <li>monitoring and backups.</li>
        </ul>
        <p>No online system can guarantee complete security.</p>
      </>
    ),
  },
  {
    id: "your-rights",
    heading: "Your Rights",
    body: (
      <>
        <p>Depending on applicable data-protection law, you may have rights including:</p>
        <ul>
          <li>access to your data;</li>
          <li>correction;</li>
          <li>deletion;</li>
          <li>restriction;</li>
          <li>objection;</li>
          <li>data portability;</li>
          <li>withdrawal of consent.</li>
        </ul>
        <p>
          You may submit a request by contacting <Mail address={CONTACT.privacy} />.
        </p>
        <p>
          MODUS may request information needed to verify your identity before fulfilling a request.
        </p>
      </>
    ),
  },
  {
    id: "account-deletion",
    heading: "Account Deletion",
    body: (
      <>
        <p>
          Where MODUS accounts are available, you may request deletion of your account and
          associated personal data by contacting <Mail address={CONTACT.privacy} />.
        </p>
        <p>Some information may be retained where required for:</p>
        <ul>
          <li>legal compliance;</li>
          <li>dispute resolution;</li>
          <li>fraud prevention;</li>
          <li>security;</li>
          <li>financial administration.</li>
        </ul>
        <p>
          When the account system is launched, this section will explain what happens to saved
          diagnostics and other stored information when an account is deleted.
        </p>
      </>
    ),
  },
  {
    id: "automated-processing",
    heading: "Automated Processing",
    body: (
      <>
        <p>MODUS may use software to organise, analyse or personalise information.</p>
        <p>
          Unless expressly stated otherwise, MODUS does not make decisions producing legal or
          similarly significant effects solely through automated processing.
        </p>
      </>
    ),
  },
  {
    id: "children",
    heading: "Children",
    body: (
      <>
        <p>MODUS is primarily intended for businesses and professionals.</p>
        <p>The website is not designed to intentionally collect personal data from children.</p>
      </>
    ),
  },
  {
    id: "complaints",
    heading: "Complaints",
    body: (
      <>
        <p>
          If you have concerns about how MODUS handles your information, you can contact MODUS first
          at <Mail address={CONTACT.privacy} />.
        </p>
        <p>
          You may also have the right to submit a complaint to the{" "}
          <strong>Autoriteit Persoonsgegevens</strong>, the Dutch data-protection authority.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    heading: "Changes to This Policy",
    body: (
      <>
        <p>
          MODUS may update this Privacy Policy as its services, technology or legal obligations
          change.
        </p>
        <p>The current version and latest update date will always be shown on this page.</p>
      </>
    ),
  },
  {
    id: "contact",
    heading: "Contact",
    body: (
      <>
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
            General: <Mail address={CONTACT.general} />
          </li>
          <li>
            Privacy, data rights and account-deletion requests: <Mail address={CONTACT.privacy} />
          </li>
          <li>
            Account and diagnostic support: <Mail address={CONTACT.support} />
          </li>
        </ul>
      </>
    ),
  },
];

export default function PrivacyPolicy() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated={LEGAL_UPDATED}
      sections={sections}
      intro={
        <>
          <p>MODUS respects your privacy.</p>
          <p>
            This Privacy Policy explains what personal data MODUS may collect, why it is processed,
            how it is protected and what rights you have.
          </p>
          <p>
            MODUS is operated by Joris van Rijn, trading as <strong>MODUS</strong>.
          </p>
          <p>
            <strong>Website:</strong> withmodus.co
            <br />
            <strong>Privacy contact:</strong> <Mail address={CONTACT.privacy} />
          </p>
          <p>
            Where MODUS determines why and how personal data is processed, MODUS acts as the data
            controller.
          </p>
        </>
      }
    />
  );
}
