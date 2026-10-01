type Tone = "dark" | "light" | "invert";
type Size = "sm" | "md" | "lg" | "xl";

const lineColor: Record<Tone, string> = {
  dark: "#151716",
  light: "#FAFAF8",
  invert: "#FFFFFF",
};

const squareColor: Record<Tone, string> = {
  dark: "#123C2D",
  light: "#123C2D",
  invert: "#FFFFFF",
};

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
 * The supplied mark as a green rounded tile with white figure — the form
 * in `assets/modus-logo-source.png`, which is preserved unchanged at
 * `/public/brand/modus-logo-source.png` (1362×1368, effectively square).
 *
 * THIS SVG IS A RECONSTRUCTION, not the original vector. No original SVG
 * was supplied. It is traced from the raster's proportions — a centred
 * square with four detached orthogonal bars, white on `#1E3B2E`, on a
 * rounded-square tile — and should be replaced the moment an authoritative
 * vector export exists. It is not presented as the official asset.
 *
 * The figure is deliberately the same geometry `LogoMark` below already
 * drew; that component was already correct and is not an invented M or a
 * three-bar substitute. Only the tile and the white-on-green treatment
 * are new.
 */
export function LogoTile({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      <rect width="100" height="100" rx="22" fill="#1E3B2E" />
      <g fill="#FFFFFF">
        {/* centre square */}
        <rect x="43" y="43" width="14" height="14" />
        {/* four detached orthogonal bars */}
        <rect x="47.5" y="16" width="5" height="22" />
        <rect x="47.5" y="62" width="5" height="22" />
        <rect x="16" y="47.5" width="22" height="5" />
        <rect x="62" y="47.5" width="22" height="5" />
      </g>
    </svg>
  );
}

export function LogoMark({
  tone = "dark",
  className = "",
}: {
  tone?: Tone;
  className?: string;
}) {
  const line = lineColor[tone];
  const square = squareColor[tone];
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <line x1="0" y1="50" x2="38" y2="50" stroke={line} strokeWidth="4" />
      <line x1="62" y1="50" x2="100" y2="50" stroke={line} strokeWidth="4" />
      <line x1="50" y1="0" x2="50" y2="38" stroke={line} strokeWidth="4" />
      <line x1="50" y1="62" x2="50" y2="100" stroke={line} strokeWidth="4" />
      <rect x="42" y="42" width="16" height="16" fill={square} />
    </svg>
  );
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
