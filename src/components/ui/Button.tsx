import Link from "next/link";
import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { AnimatedChars } from "@/components/ui/AnimatedChars";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

// `primary`'s fill moved onto the decorative `[data-chars-bg]` layer so it
// can inset on hover, exactly as the diagnostic CTAs do. At rest the
// control looks identical to before. `secondary` and `ghost` have no fill,
// so they get the character roll with no background layer.
const VARIANT_CLASS: Record<Variant, string> = {
  primary: "text-modus-foreground",
  secondary: "border border-line text-graphite hover:border-ink/30 disabled:hover:border-line",
  ghost: "text-graphite hover:text-ink",
};

const VARIANT_BG: Record<Variant, string | null> = {
  primary: "bg-modus group-hover/btn:bg-modus-light group-disabled/btn:bg-modus",
  secondary: null,
  ghost: null,
};

const SIZE_CLASS: Record<Size, string> = {
  md: "px-4 py-2.5 text-[13px] gap-2",
  lg: "px-6 py-3.5 text-[14px] gap-2",
};

// `rounded-full`: the shared pill shape, matching the diagnostic CTAs.
const BASE =
  "group/btn relative inline-flex items-center justify-center rounded-full font-medium transition-colors duration-200 ease-modus disabled:cursor-not-allowed disabled:opacity-40";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps & {
  href: string;
};

/**
 * Design-system button primitive — visually matches the hand-rolled
 * buttons already used throughout the marketing site (nav CTA, diagnostic
 * "begin", actions kanban move button, etc.) exactly, so adopting it later
 * causes zero visual diff. Not yet wired into any existing page — see
 * MODUS_REDESIGN_REPORT.md's Checkpoint 1 entry.
 */
export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", size = "md", className = "", children } = props;
  const classes = `${BASE} ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`;
  const bg = VARIANT_BG[variant];

  // Only a plain string label can be split safely. Anything else — an
  // icon, an arrow, a spinner, a nested element — is rendered untouched,
  // which is what keeps arrows and loading indicators out of the
  // animated characters rather than having them split into glyphs.
  const label = typeof children === "string" ? <AnimatedChars text={children} /> : children;
  const animated = typeof children === "string";

  const surface = bg ? <span data-chars-bg className={bg} aria-hidden="true" /> : null;

  if (props.href) {
    return (
      <Link href={props.href} data-chars-root={animated ? "" : undefined} className={classes}>
        {surface}
        {label}
      </Link>
    );
  }

  const { variant: _variant, size: _size, className: _className, children: _children, href: _href, ...rest } = props;
  return (
    <button
      type="button"
      {...rest}
      // A disabled or pending control keeps `disabled`, and the CSS
      // excludes `[disabled]` from the hover and focus rules, so its
      // characters stay still and its surface never insets.
      data-chars-root={animated ? "" : undefined}
      className={classes}
    >
      {surface}
      {label}
    </button>
  );
}
