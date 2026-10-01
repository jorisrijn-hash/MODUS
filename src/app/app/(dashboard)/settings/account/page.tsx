"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { PageHeader } from "@/components/app/ui/PageHeader";
import { AppCard, AppCardHeader } from "@/components/app/ui/AppCard";
import { SettingsNav } from "@/components/app/SettingsNav";
import { DEMO_CLIENT } from "@/lib/appDemo/data";
import { signOut } from "@/lib/appDemo/session";

export default function AccountPage() {
  const router = useRouter();
  const [twoFactor, setTwoFactor] = useState(true);

  return (
    <div>
      <PageHeader title="Settings" />
      <SettingsNav />

      <AppCard className="max-w-xl">
        <AppCardHeader title="Account owner" />
        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-modus text-[13px] font-medium text-paper">
            {DEMO_CLIENT.contactName.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <p className="text-[14px] font-medium text-ink">{DEMO_CLIENT.contactName}</p>
            <p className="text-[12.5px] text-muted">{DEMO_CLIENT.contactRole}</p>
          </div>
        </div>
      </AppCard>

      <AppCard className="mt-6 max-w-xl">
        <AppCardHeader title="Security" />
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13.5px] text-ink">Password</p>
              <p className="text-[12px] text-muted">Last changed 3 months ago</p>
            </div>
            <button type="button" className="rounded-md border border-line px-3 py-1.5 text-[12px] font-medium text-graphite hover:border-ink/30">
              Change
            </button>
          </div>
          <div className="flex items-center justify-between border-t border-line pt-4">
            <div>
              <p className="text-[13.5px] text-ink">Two-factor authentication</p>
              <p className="text-[12px] text-muted">Adds a verification step at sign in</p>
            </div>
            <button
              type="button"
              onClick={() => setTwoFactor((v) => !v)}
              className={`relative h-6 w-11 rounded-full transition-colors ${twoFactor ? "bg-modus" : "bg-line"}`}
              aria-pressed={twoFactor}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-paper shadow transition-transform ${
                  twoFactor ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </AppCard>

      <button
        type="button"
        onClick={() => {
          signOut();
          router.push("/app/login");
        }}
        className="mt-6 flex items-center gap-2 rounded-md border border-line px-4 py-2.5 text-[13px] font-medium text-graphite transition-colors hover:border-signal/40 hover:text-signal"
      >
        <LogOut className="h-4 w-4" strokeWidth={1.75} />
        Sign out
      </button>
    </div>
  );
}
