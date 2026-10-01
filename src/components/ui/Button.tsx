import Link from "next/link";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "bg-modus text-modus-foreground hover:bg-modus-light disabled:hover:bg-modus",
  secondary: "border border-line text-graphite hover:border-ink/30 disabled:hover:border-line",
  ghost: "text-graphite hover:text-ink",
};

const SIZE_CLASS: Record<Size, string> = {
  md: "px-4 py-2.5 text-[13px] gap-2",
  lg: "px-6 py-3.5 text-[14px] gap-2",
};

const BASE =
  "inline-flex items-center justify-center rounded font-medium transition-colors duration-200 ease-modus disabled:cursor-not-allowed disabled:opacity-40";

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

  if (props.href) {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  const { variant: _variant, size: _size, className: _className, children: _children, href: _href, ...rest } = props;
  return (
    <button type="button" {...rest} className={classes}>
      {children}
    </button>
  );
}
