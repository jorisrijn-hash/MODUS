import { type ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";

const SIZE_CLASS = {
  xl: "text-display-xl",
  lg: "text-display-lg",
  md: "text-display-md",
  sm: "text-display-sm",
} as const;

/**
 * Display-role heading primitive — Checkpoint 3, Section 16. Wraps the
 * Checkpoint 1 fluid `text-display-*` tokens with the existing `Reveal`
 * entrance (blur variant on by default here, since a hero-weight heading
 * is exactly the "focused content" case that primitive's blur mode was
 * added for). `as` controls the actual heading level independently of
 * visual size, so page structure (one real `h1`) never has to match
 * whichever size looks right.
 */
export function DisplayHeading({
  children,
  size = "lg",
  as = "h2",
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  size?: keyof typeof SIZE_CLASS;
  as?: "h1" | "h2" | "h3";
  delay?: number;
  className?: string;
}) {
  const Tag = as;
  return (
    <Reveal blur delay={delay}>
      <Tag className={`text-balance font-semibold text-ink ${SIZE_CLASS[size]} ${className}`}>{children}</Tag>
    </Reveal>
  );
}
