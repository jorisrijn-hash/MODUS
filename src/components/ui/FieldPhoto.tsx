"use client";

import { type ReactNode } from "react";
import { useDict } from "@/lib/i18n/context";

export function FieldPhoto({
  id,
  caption,
  aspect = "aspect-[4/5]",
  className = "",
}: {
  id: string;
  caption: ReactNode;
  aspect?: string;
  className?: string;
}) {
  const dict = useDict();
  return (
    <div className={`relative ${aspect} ${className}`}>
      <div className="reg-mark -left-1 -top-1" />
      <div className="reg-mark -right-1 -top-1" />
      <div className="reg-mark -bottom-1 -left-1" />
      <div className="reg-mark -bottom-1 -right-1" />

      <div
        className="absolute inset-0 overflow-hidden rounded-sm border border-line"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, #E2E4DE 0px, #E2E4DE 1px, #EBEBE5 1px, #EBEBE5 14px)",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted/70">
            {dict.fieldPhoto.placeholder}
          </span>
        </div>
      </div>

      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-graphite">
          {id}
        </p>
        <p className="rounded-sm bg-paper/90 px-2 py-1 text-[11px] text-graphite backdrop-blur-sm">
          {caption}
        </p>
      </div>
    </div>
  );
}
