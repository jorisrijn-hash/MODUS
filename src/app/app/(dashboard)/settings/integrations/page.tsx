"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { PageHeader } from "@/components/app/ui/PageHeader";
import { AppCard, AppCardHeader } from "@/components/app/ui/AppCard";
import { SettingsNav } from "@/components/app/SettingsNav";
import { StatusBadge } from "@/components/app/ui/StatusBadge";
import { INTEGRATIONS_CONNECTED, INTEGRATIONS_AVAILABLE } from "@/lib/appDemo/data";

export default function IntegrationsPage() {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState<string[]>([]);

  function handleConnect(name: string) {
    setConnecting(name);
    window.setTimeout(() => {
      setConnecting(null);
      setConnected((prev) => [...prev, name]);
    }, 1100);
  }

  return (
    <div>
      <PageHeader title="Settings" />
      <SettingsNav />

      <AppCard padded={false}>
        <div className="p-5 pb-0 sm:p-6 sm:pb-0">
          <AppCardHeader title="Connected" />
        </div>
        <ul className="mt-4 divide-y divide-line">
          {INTEGRATIONS_CONNECTED.map((i) => (
            <li key={i.id} className="flex items-center justify-between px-5 py-3.5 sm:px-6">
              <div>
                <p className="text-[13.5px] font-medium text-ink">{i.name}</p>
                <p className="text-[11.5px] text-muted">Connected since {i.connectedSince}</p>
              </div>
              <StatusBadge tone="positive">
                <span className="flex items-center gap-1">
                  <Check className="h-3 w-3" strokeWidth={2} /> Connected
                </span>
              </StatusBadge>
            </li>
          ))}
        </ul>
      </AppCard>

      <AppCard padded={false} className="mt-6">
        <div className="p-5 pb-0 sm:p-6 sm:pb-0">
          <AppCardHeader title="Available" />
        </div>
        <ul className="mt-4 divide-y divide-line">
          {INTEGRATIONS_AVAILABLE.map((name) => {
            const isConnected = connected.includes(name);
            const isConnecting = connecting === name;
            return (
              <li key={name} className="flex items-center justify-between px-5 py-3.5 sm:px-6">
                <p className="text-[13.5px] text-graphite">{name}</p>
                {isConnected ? (
                  <StatusBadge tone="positive">
                    <span className="flex items-center gap-1">
                      <Check className="h-3 w-3" strokeWidth={2} /> Connected
                    </span>
                  </StatusBadge>
                ) : (
                  <button
                    type="button"
                    disabled={isConnecting}
                    onClick={() => handleConnect(name)}
                    className="flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-[12px] font-medium text-graphite transition-colors hover:border-ink/30 disabled:opacity-60"
                  >
                    {isConnecting ? (
                      "Connecting…"
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" strokeWidth={1.75} /> Connect
                      </>
                    )}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </AppCard>
    </div>
  );
}
