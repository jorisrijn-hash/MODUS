"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app/AppSidebar";
import { AppTopbar } from "@/components/app/AppTopbar";
import { CommandMenu } from "@/components/app/CommandMenu";
import { MobileNav } from "@/components/app/MobileNav";
import { useSessionStage } from "@/lib/appDemo/session";

export function AppShell({ children }: { children: ReactNode }) {
  const stage = useSessionStage();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (stage === "signed_out") router.replace("/app/login");
  }, [stage, router]);

  if (stage !== "signed_in") {
    return <div className="min-h-screen bg-mineral" />;
  }

  return (
    <div className="min-h-screen bg-mineral">
      <AppSidebar />
      <div className="md:pl-60">
        <AppTopbar onMenuClick={() => setMobileNavOpen(true)} />
        <main className="px-6 py-6 md:px-8 md:py-8">{children}</main>
      </div>
      <CommandMenu />
      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
    </div>
  );
}
