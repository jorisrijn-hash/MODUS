import { type ReactNode } from "react";

export function AppCard({
  children,
  className = "",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div className={`rounded-lg border border-line bg-paper ${padded ? "p-5 sm:p-6" : ""} ${className}`}>
      {children}
    </div>
  );
}

export function AppCardHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h3 className="text-[13.5px] font-medium text-ink">{title}</h3>
      {action}
    </div>
  );
}
