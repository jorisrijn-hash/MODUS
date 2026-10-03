import { requireAdminSession } from "@/lib/auth/clerk";
import { adminDisplayName } from "@/lib/auth/adminIdentity";
import { prisma } from "@/lib/db";

export default async function SettingsPage() {
  // The layout already gates this route; re-reading the membership here
  // keeps the page correct if it is ever rendered outside that layout.
  const { userId } = await requireAdminSession();
  const [admin, dbCheck] = await Promise.all([
    adminDisplayName(userId),
    prisma.diagnostic.count().then(() => true).catch(() => false),
  ]);

  return (
    <div className="max-w-2xl">
      <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">MODUS / Settings</p>
      <h1 className="mt-2 text-2xl font-semibold text-ink">Account & system.</h1>

      <div className="mt-8 space-y-8">
        <SettingsSection title="Account">
          <Row label="Admin user" value={admin} />
        </SettingsSection>

        {/*
          * These described the shared-password login — Argon2id hashing,
          * the session cookie, failed-attempt counts from the
          * LoginAttempt table. That mechanism no longer guards anything,
          * so reporting its properties here would have been a security
          * panel describing a door that is not on the building.
          */}
        <SettingsSection title="Access">
          <Row label="Authentication" value="Clerk" tone="modus" />
          <Row label="Authorization" value="AdminMember row, re-read per request" />
          <Row label="Revocation" value="Takes effect on the next request" />
        </SettingsSection>

        <SettingsSection title="Security">
          {/* Stated plainly rather than omitted: an admin reading this
              panel should not have to infer what is not enforced. */}
          <Row
            label="Multi-factor"
            value={process.env.ADMIN_MFA_REQUIRED === "true" ? "Required" : "Not enforced"}
            tone={process.env.ADMIN_MFA_REQUIRED === "true" ? "modus" : "signal"}
          />
          <Row label="Password sign-in" value="Removed" />
        </SettingsSection>

        <SettingsSection title="System">
          <Row label="Database" value={dbCheck ? "Connected" : "Unavailable"} tone={dbCheck ? "modus" : "signal"} />
          <Row label="Environment" value={process.env.NODE_ENV === "production" ? "Production" : "Development"} />
        </SettingsSection>
      </div>
    </div>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">{title}</p>
      <div className="mt-3 divide-y divide-line rounded-md border border-line bg-surface">{children}</div>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "modus" | "signal" }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <p className="text-[13px] text-graphite">{label}</p>
      <p
        className={`font-mono text-[12px] uppercase tracking-[0.04em] ${
          tone === "modus" ? "text-modus" : tone === "signal" ? "text-signal" : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
