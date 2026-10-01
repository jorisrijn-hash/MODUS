"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  Gauge,
  Radar,
  Waypoints,
  ChartSpline,
  Network,
  MessageSquare,
} from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import {
  OverviewPanel,
  SignalsPanel,
  ImprovementsPanel,
  PerformancePanel,
  SystemsPanel,
  AskModusPanel,
} from "@/components/sections/PlatformPanels";
import { useDict } from "@/lib/i18n/context";
import { track } from "@/lib/chatbot";

const navIcons: Record<string, typeof Gauge> = {
  overview: Gauge,
  signals: Radar,
  improvements: Waypoints,
  performance: ChartSpline,
  systems: Network,
  askModus: MessageSquare,
};

const navPanels: Record<string, typeof OverviewPanel> = {
  overview: OverviewPanel,
  signals: SignalsPanel,
  improvements: ImprovementsPanel,
  performance: PerformancePanel,
  systems: SystemsPanel,
  askModus: AskModusPanel,
};

export function PlatformMockup() {
  const dict = useDict();
  const t = dict.platform.mockup;
  const [active, setActive] = useState("overview");
  const ActivePanel = navPanels[active] ?? OverviewPanel;

  function selectTab(id: string) {
    if (id === active) return;
    track("platform_tab_change", { from: active, to: id });
    setActive(id);
  }

  return (
    <div className="relative overflow-hidden rounded-md border border-line bg-white">
      <div className="reg-mark -left-1 -top-1" />
      <div className="reg-mark -right-1 -top-1" />
      <div className="reg-mark -bottom-1 -left-1" />
      <div className="reg-mark -bottom-1 -right-1" />

      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
        {/* min-w-0: defensive, not a fix for a confirmed bug in this
            component specifically — a Checkpoint 4 mobile-overflow
            regression was initially (and incorrectly) suspected to be
            this nav's overflow-x-auto tab row; verified via computed
            styles that this nav was already correctly width-constrained
            and scrolling within itself (the real cause was elsewhere —
            see CasesPreview.tsx/MediaFrame.tsx). min-w-0 is still kept
            here since it's the standard, zero-visual-impact safeguard
            for any flex/grid item that relies on its own overflow-x-auto
            to contain wider content — cheap insurance against the same
            bug class, not a claim that it was needed today. */}
        <div className="min-w-0 border-b border-line p-4 md:border-b-0 md:border-r">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <LogoMark className="h-4 w-4" />
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              {t.panelLabel}
            </span>
          </div>
          <nav className="mt-3 flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
            {t.nav.map((item) => {
              const Icon = navIcons[item.id];
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => selectTab(item.id)}
                  className={`flex shrink-0 items-center gap-2.5 rounded px-2.5 py-2 text-left text-[13px] transition-colors duration-150 ${
                    isActive
                      ? "bg-ink text-paper"
                      : "text-graphite hover:bg-surface"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.6} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <motion.div layout className="overflow-hidden p-6">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <ActivePanel />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
