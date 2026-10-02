type Tone = "dark" | "light" | "invert";
type Size = "sm" | "md" | "lg" | "xl";

const markSize: Record<Size, string> = {
  sm: "h-5 w-5",
  md: "h-7 w-7",
  lg: "h-10 w-10",
  xl: "h-14 w-14",
};

const wordmarkSize: Record<Size, string> = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-2xl",
  xl: "text-5xl md:text-6xl",
};

const taglineSize: Record<Size, string> = {
  sm: "text-[9px]",
  md: "text-[10px]",
  lg: "text-[11px]",
  xl: "text-[13px]",
};

/**
 * The MODUS mark: a centre square with four detached orthogonal bars.
 *
 * NO TILE. The green rounded-square tile this used to draw is gone — the
 * geometry now sits directly on whatever surface is behind it, which is
 * what the brief asks for and what lets the dock read as part of the page
 * rather than as a sticker on top of it. "Transparent background" here
 * means the tile is genuinely absent, not repainted in the canvas colour.
 *
 * Everything is `currentColor`, so the mark is theme-safe by construction:
 * ink on light surfaces, cream on genuinely dark ones, inherited from
 * whatever sets `color` on the ancestor. No tone prop, no hardcoded hex,
 * nothing to keep in sync with the token system.
 *
 * The geometry is traced from the supplied raster at
 * `/public/brand/modus-logo-source.png` (1362x1368, effectively square)
 * and is a RECONSTRUCTION, not an original vector export. Proportions are
 * unchanged from the tiled version that preceded it — only the tile and
 * the white fill were removed.
 */
export function LogoGlyph({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
    >
      {/* centre square */}
      <rect x="43" y="43" width="14" height="14" />
      {/* four detached orthogonal bars */}
      <rect x="47.5" y="16" width="5" height="22" />
      <rect x="47.5" y="62" width="5" height="22" />
      <rect x="16" y="47.5" width="22" height="5" />
      <rect x="62" y="47.5" width="22" height="5" />
    </svg>
  );
}

/**
 * Deprecated alias kept so existing imports keep compiling while call
 * sites migrate. Renders the bare glyph; it no longer draws a tile.
 */
export const LogoTile = LogoGlyph;

/**
 * The mark with a tone hint, for call sites that cannot set `color`
 * themselves. Delegates to `LogoGlyph` — same geometry, no tile.
 *
 * This previously drew its bars in a hardcoded `#151716` and its centre
 * square in `#123C2D`: both stale pre-rebuild values that no longer exist
 * in the token system (ink is now #1A1614, green #1E3B2E), so every
 * diagnostic, admin, chatbot and app-sidebar mark was quietly rendering
 * in the old palette. Routing through tokens fixes that everywhere at
 * once and gives the bare ink mark the brief asks for in the diagnostic,
 * auth and admin headers.
 */
export function LogoMark({
  tone = "dark",
  className = "",
}: {
  tone?: Tone;
  className?: string;
}) {
  // "dark" = a dark mark for a light surface; "light"/"invert" = a light
  // mark for a genuinely dark one.
  const color = tone === "dark" ? "text-ink" : "text-inverted-foreground";
  return <LogoGlyph className={`${color} ${className}`} />;
}

function Wordmark({ tone, size }: { tone: Tone; size: Size }) {
  // "dark" tone = dark text, for a light background; "light"/"invert" =
  // light text, for a dark background — fixed to inverted-foreground
  // rather than the theme-relative paper token, same reasoning as
  // LanguageSwitch's "light" tone. See globals.css's --surface-inverted comment.
  const color = tone === "dark" ? "text-ink" : "text-inverted-foreground";
  return (
    <span
      className={`block font-sans font-semibold uppercase leading-none tracking-[0.16em] ${wordmarkSize[size]} ${color}`}
    >
      MODUS
    </span>
  );
}

function Tagline({ tone, size }: { tone: Tone; size: Size }) {
  const color = tone === "dark" ? "text-muted" : "text-inverted-foreground/60";
  return (
    <span
      className={`block font-mono uppercase leading-none tracking-[0.14em] ${taglineSize[size]} ${color}`}
    >
      A better way to operate.
    </span>
  );
}

/**
 * Central MODUS logo system. Variants mirror the brand style guide (v1.0)
 * lockups exactly — do not create ad-hoc wordmark/symbol markup elsewhere.
 * Use `size` to scale (no font-size utilities in `className`, to avoid
 * Tailwind class-order collisions); `className` is for layout/spacing only.
 */
export function Logo({
  variant = "wordmark",
  tone = "dark",
  size = "md",
  className = "",
}: {
  variant?: "symbol" | "wordmark" | "primary" | "stacked" | "alt";
  tone?: Tone;
  size?: Size;
  className?: string;
}) {
  if (variant === "symbol") {
    return <LogoMark tone={tone} className={`${markSize[size]} ${className}`} />;
  }

  if (variant === "wordmark") {
    return (
      <span className={className}>
        <Wordmark tone={tone} size={size} />
      </span>
    );
  }

  if (variant === "primary") {
    return (
      <span className={`inline-flex items-center gap-4 ${className}`}>
        <LogoMark tone={tone} className={`shrink-0 ${markSize[size]}`} />
        <span className="flex flex-col gap-1.5">
          <Wordmark tone={tone} size={size} />
          <Tagline tone={tone} size={size} />
        </span>
      </span>
    );
  }

  if (variant === "stacked") {
    return (
      <span className={`inline-flex flex-col items-center gap-4 ${className}`}>
        <LogoMark tone={tone} className={markSize[size]} />
        <span className="flex flex-col items-center gap-2">
          <Wordmark tone={tone} size={size} />
          <Tagline tone={tone} size={size} />
        </span>
      </span>
    );
  }

  // alt: wordmark + "Improvement Infrastructure" caption
  return (
    <span className={`flex flex-col gap-1.5 ${className}`}>
      <Wordmark tone={tone} size={size} />
      <span
        className={`font-mono uppercase leading-none tracking-[0.12em] ${taglineSize[size]} ${
          tone === "dark" ? "text-muted" : "text-inverted-foreground/50"
        }`}
      >
        Improvement Infrastructure
      </span>
    </span>
  );
}
