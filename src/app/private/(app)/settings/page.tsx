import { getSession } from "@/lib/auth/session";
import { lastSuccessfulLogin, recentFailedLoginCount } from "@/lib/auth/rateLimit";
import { prisma } from "@/lib/db";

export default async function SettingsPage() {
  const session = await getSession();
  const [lastLogin, failedCount, dbCheck] = await Promise.all([
    lastSuccessfulLogin(),
    recentFailedLoginCount(24),
    prisma.diagnostic.count().then(() => true).catch(() => false),
  ]);

  return (
    <div className="max-w-2xl">
      <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">MODUS / Settings</p>
      <h1 className="mt-2 text-2xl font-semibold text-ink">Account & system.</h1>

      <div className="mt-8 space-y-8">
        <SettingsSection title="Account">
          <Row label="Admin user" value={session.username ?? "Not set"} />
        </SettingsSection>

        <SettingsSection title="Session">
          <Row label="Status" value="Active" tone="modus" />
          <Row
            label="Last successful login"
            value={lastLogin ? new Date(lastLogin.createdAt).toLocaleString("en-GB") : "This session"}
          />
        </SettingsSection>

        <SettingsSection title="Security">
          <Row label="Failed login attempts (24h)" value={String(failedCount)} tone={failedCount > 0 ? "signal" : undefined} />
          <Row label="Password hashing" value="Argon2id" />
          <Row label="Session cookie" value="HttpOnly · SameSite=Lax" />
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
      <div className="mt-3 divide-y divide-line rounded-md border border-line bg-white">{children}</div>
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
