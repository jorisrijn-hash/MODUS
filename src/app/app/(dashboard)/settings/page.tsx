import { PageHeader } from "@/components/app/ui/PageHeader";
import { AppCard, AppCardHeader } from "@/components/app/ui/AppCard";
import { SettingsNav } from "@/components/app/SettingsNav";
import { DEMO_CLIENT } from "@/lib/appDemo/data";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">{label}</p>
      <p className="mt-1 text-[14px] text-ink">{value}</p>
    </div>
  );
}

export default function SettingsBusinessPage() {
  return (
    <div>
      <PageHeader title="Settings" />
      <SettingsNav />

      <AppCard className="max-w-2xl">
        <AppCardHeader title="Business information" />
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Business name" value={DEMO_CLIENT.name} />
          <Field label="Industry" value={DEMO_CLIENT.industry} />
          <Field label="City" value={DEMO_CLIENT.city} />
          <Field label="Website" value={DEMO_CLIENT.website} />
          <Field label="Account owner" value={DEMO_CLIENT.contactName} />
          <Field label="Role" value={DEMO_CLIENT.contactRole} />
        </div>
      </AppCard>

      <AppCard className="mt-6 max-w-2xl">
        <AppCardHeader title="Notifications" />
        <div className="mt-4 space-y-3">
          {["Weekly performance summary", "New signal detected", "Monthly report ready"].map((n) => (
            <label key={n} className="flex items-center justify-between text-[13.5px] text-graphite">
              {n}
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-modus" />
            </label>
          ))}
        </div>
      </AppCard>
    </div>
  );
}
