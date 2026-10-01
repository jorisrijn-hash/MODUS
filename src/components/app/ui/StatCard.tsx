import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { AnimatedNumber } from "@/components/app/ui/AnimatedNumber";
import { Sparkline } from "@/components/app/ui/Sparkline";

export function StatCard({
  label,
  value,
  change,
  format,
  prefix,
  suffix,
  sparkline,
  period = "30 days",
  size = "default",
}: {
  label: string;
  value: number;
  change: number;
  format?: (n: number) => string;
  prefix?: string;
  suffix?: string;
  sparkline?: number[];
  period?: string;
  size?: "compact" | "default" | "large";
}) {
  const positive = change >= 0;
  return (
    <div
      className={`group rounded-lg border border-line bg-paper transition-colors hover:border-ink/15 ${
        size === "large" ? "p-6" : "p-5"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">{label}</p>
        {sparkline && size !== "compact" && (
          <span className="font-mono text-[9px] uppercase tracking-[0.06em] text-muted/70">{period}</span>
        )}
      </div>
      <p className={`mt-2.5 font-semibold text-ink ${size === "large" ? "text-[34px]" : "text-[26px]"}`}>
        <AnimatedNumber value={value} format={format} prefix={prefix} suffix={suffix} />
      </p>
      <p
        className={`mt-1.5 flex items-center gap-1 text-[12px] font-medium ${
          positive ? "text-modus" : "text-signal"
        }`}
      >
        {positive ? (
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
        ) : (
          <ArrowDownRight className="h-3.5 w-3.5" strokeWidth={2} />
        )}
        {Math.abs(change)}%
      </p>
      {sparkline && (
        <div className="mt-3">
          <Sparkline data={sparkline} positive={positive} height={size === "large" ? 44 : 32} />
        </div>
      )}
    </div>
  );
}
