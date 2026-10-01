export function SectionLabel({
  children,
  id,
  tone = "muted",
}: {
  children: string;
  id?: string;
  tone?: "muted" | "on-dark";
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          tone === "on-dark" ? "bg-modus-light" : "bg-modus"
        }`}
        aria-hidden
      />
      <span
        className={`font-mono text-[11px] uppercase tracking-[0.16em] ${
          // Fixed inverted-foreground, not the theme-relative paper token
          // — "on-dark" means "this label sits on a section that's always
          // dark regardless of site theme" (Checkpoint 4's ModusProcessSection
          // is the first real consumer of this tone). See globals.css's
          // --surface-inverted comment for why paper alone would break
          // under a dark site theme.
          tone === "on-dark" ? "text-inverted-foreground/60" : "text-muted"
        }`}
      >
        {children}
      </span>
      {id && (
        <span
          className={`font-mono text-[11px] uppercase tracking-[0.16em] ${
            tone === "on-dark" ? "text-inverted-foreground/35" : "text-muted/60"
          }`}
        >
          {id}
        </span>
      )}
    </div>
  );
}
