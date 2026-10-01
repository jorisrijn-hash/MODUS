import { PageHeader } from "@/components/app/ui/PageHeader";
import { AppCard } from "@/components/app/ui/AppCard";
import { StatusBadge } from "@/components/app/ui/StatusBadge";
import { CAMPAIGNS, ADVERTISING_BUDGET, PLANS, DEMO_CLIENT } from "@/lib/appDemo/data";

export default function CampaignsPage() {
  const totalSpend = CAMPAIGNS.reduce((sum, c) => sum + c.spend, 0);
  const totalClicks = CAMPAIGNS.reduce((sum, c) => sum + c.clicks, 0);
  const totalLeads = CAMPAIGNS.reduce((sum, c) => sum + c.leads, 0);
  const plan = PLANS[DEMO_CLIENT.plan];

  return (
    <div>
      <PageHeader title="Campaigns" subtitle="Google and Meta advertising performance." />

      <div className="rounded-lg border border-line bg-mineral p-4">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-[13px]">
          <div>
            <span className="text-muted">MODUS fee </span>
            <span className="font-medium text-ink">€{plan.price}/month</span>
          </div>
          <div className="h-4 w-px bg-line" />
          <div>
            <span className="text-muted">Advertising spend </span>
            <span className="font-medium text-ink">€{ADVERTISING_BUDGET}/month</span>
          </div>
          <div className="h-4 w-px bg-line" />
          <div>
            <span className="text-muted">Total monthly spend </span>
            <span className="font-medium text-ink">€{plan.price + ADVERTISING_BUDGET}/month</span>
          </div>
        </div>
        <p className="mt-2 text-[11.5px] text-muted">
          Advertising budget is always billed separately from the MODUS retainer.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <AppCard>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">Spend (this month)</p>
          <p className="mt-2 text-[22px] font-semibold text-ink">€{totalSpend.toLocaleString("nl-NL")}</p>
        </AppCard>
        <AppCard>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">Clicks</p>
          <p className="mt-2 text-[22px] font-semibold text-ink">{totalClicks.toLocaleString("nl-NL")}</p>
        </AppCard>
        <AppCard>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">Leads</p>
          <p className="mt-2 text-[22px] font-semibold text-ink">{totalLeads}</p>
        </AppCard>
        <AppCard>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">Avg. CPL</p>
          <p className="mt-2 text-[22px] font-semibold text-ink">€{(totalSpend / totalLeads).toFixed(2)}</p>
        </AppCard>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-line bg-paper">
        <table className="w-full min-w-[640px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-[0.05em] text-muted">
              <th className="px-4 py-3 font-medium">Campaign</th>
              <th className="px-4 py-3 font-medium">Platform</th>
              <th className="px-4 py-3 font-medium">Spend</th>
              <th className="px-4 py-3 font-medium">Clicks</th>
              <th className="px-4 py-3 font-medium">Leads</th>
              <th className="px-4 py-3 font-medium">CPL</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {CAMPAIGNS.map((c) => (
              <tr key={c.id} className="border-b border-line last:border-b-0">
                <td className="px-4 py-3 font-medium text-ink">{c.name}</td>
                <td className="px-4 py-3 text-graphite">{c.platform}</td>
                <td className="px-4 py-3 text-graphite">€{c.spend.toLocaleString("nl-NL")}</td>
                <td className="px-4 py-3 text-graphite">{c.clicks.toLocaleString("nl-NL")}</td>
                <td className="px-4 py-3 text-graphite">{c.leads}</td>
                <td className="px-4 py-3 text-graphite">€{(c.spend / c.leads).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <StatusBadge tone={c.status === "active" ? "positive" : "neutral"}>{c.status}</StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
