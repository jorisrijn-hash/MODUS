import { PageHeader } from "@/components/app/ui/PageHeader";
import { AppCard, AppCardHeader } from "@/components/app/ui/AppCard";
import { SettingsNav } from "@/components/app/SettingsNav";
import { StatusBadge } from "@/components/app/ui/StatusBadge";
import { DEMO_CLIENT, PLANS, ADVERTISING_BUDGET, INVOICES } from "@/lib/appDemo/data";

export default function BillingPage() {
  const plan = PLANS[DEMO_CLIENT.plan];

  return (
    <div>
      <PageHeader title="Settings" />
      <SettingsNav />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AppCard>
          <AppCardHeader title="Current plan" />
          <p className="mt-4 text-[13px] text-muted">Plan</p>
          <p className="text-[18px] font-semibold text-ink">{plan.name}</p>
          <p className="mt-1 text-[14px] text-graphite">€{plan.price}/month</p>

          <p className="mt-4 text-[13px] text-muted">Next payment</p>
          <p className="text-[14px] text-ink">01 October 2026</p>
        </AppCard>

        <AppCard>
          <AppCardHeader title="Advertising" />
          <p className="mt-4 text-[13px] text-muted">Budget</p>
          <p className="text-[18px] font-semibold text-ink">€{ADVERTISING_BUDGET}/month</p>
          <p className="mt-3 max-w-xs text-[12.5px] leading-relaxed text-muted">
            Paid separately from the MODUS retainer. Adjust anytime in Campaigns.
          </p>
        </AppCard>
      </div>

      <AppCard padded={false} className="mt-6">
        <div className="p-5 pb-0 sm:p-6 sm:pb-0">
          <AppCardHeader title="Invoice history" />
        </div>
        <ul className="mt-4 divide-y divide-line">
          {INVOICES.map((inv) => (
            <li key={inv.id} className="flex items-center justify-between px-5 py-3.5 sm:px-6">
              <div>
                <p className="text-[13.5px] font-medium text-ink">{inv.period}</p>
                <p className="text-[11.5px] text-muted">{inv.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[13.5px] text-graphite">€{inv.amount.toLocaleString("nl-NL")}</span>
                <StatusBadge tone="positive">{inv.status}</StatusBadge>
              </div>
            </li>
          ))}
        </ul>
      </AppCard>
    </div>
  );
}
