
import Link from "@/i18n/Link";
import { BRAND } from "@/lib/constants/site";
import { cn } from "@/lib/utils/cn";

import { BreakoutMark } from "./BreakoutMark";

type LogoTone = "dark" | "light";

interface LogoProps {
  /** `light` is for indigo backgrounds and reverses the mark and logotype. */
  tone?: LogoTone;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Renders the artwork on its own instead of a link to the homepage. */
  asStatic?: boolean;
  /** Accepted for call-site compatibility; the mark is inline SVG, so there
      is no image request left to prioritise. */
  priority?: boolean;
}

/**
 * Type size per size token. The mark and the gap are set in `em` from it, so
 * the lockup keeps the concept sheet's proportions at every size: the mark is
 * 1.84× the cap height (1.34em) and sits 0.4em from the name.
 */
const NAME: Record<"sm" | "md" | "lg", string> = {
  sm: "text-[1.25rem]",
  md: "text-[1.4rem] lg:text-[1.75rem]",
  lg: "text-[1.9rem] lg:text-[2.1rem]",
};

export function Logo({
  tone = "dark",
  size = "md",
  className,
  asStatic,
}: LogoProps) {
  const artwork = (
    <span
      className={cn(
        "inline-flex items-center gap-[0.4em] leading-none",
        tone === "light" ? "text-white" : "text-logo-navy",
        NAME[size],
        className,
      )}
    >
      {/* `w-auto` keeps the mark's aspect; its height follows the type. */}
      <BreakoutMark className="h-[1.34em] w-auto shrink-0" />

      {/* "VidyantIAS" in Plus Jakarta Sans Bold: its round bowls answer the
          disc and its open, sharp V the cut-out. A hair of space before "IAS".
          No saffron in the name — the break is the only one. */}
      <span className="inline-flex items-baseline font-brand font-bold tracking-[-0.01em]">
        <span>{BRAND.logotype.lead}</span>
        <span className="ml-[0.08em]">{BRAND.logotype.trail}</span>
      </span>
    </span>
  );

  if (asStatic) return artwork;

  return (
    <Link
      href="/"
      aria-label={`${BRAND.name} — home`}
      className="inline-flex items-center rounded-sm"
    >
      {artwork}
    </Link>
  );
}
