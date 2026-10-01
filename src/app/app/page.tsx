"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStage } from "@/lib/appDemo/session";

export default function AppEntryPage() {
  const stage = useSessionStage();
  const router = useRouter();

  useEffect(() => {
    // "unknown" is the transient bootstrap value before the real
    // localStorage-backed session syncs in — don't decide off it, or a
    // signed-in visitor can bounce through /app/login on a hard reload.
    if (stage === "unknown") return;
    router.replace(stage === "signed_in" ? "/app/overview" : "/app/login");
  }, [stage, router]);

  return <div className="min-h-screen bg-ink" />;
}
