import Link from "@/i18n/Link";
import { LOGO_HEX, LOGO_TAGLINE } from "@/lib/brand/mark";
import { BRAND } from "@/lib/constants/site";
import { cn } from "@/lib/utils/cn";

import { BrandMark } from "./BrandMark";

type LogoTone = "dark" | "light";

interface LogoProps {
  /** `light` is for indigo/navy backgrounds: cream disc and cream "Vidyant". */
  tone?: LogoTone;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Renders the artwork on its own instead of a link to the homepage. */
  asStatic?: boolean;
  /** Sets "Right knowledge. Right direction. Every step." under the lockup. */
  withTagline?: boolean;
  /** Accepted for call-site compatibility; the mark is inline SVG, so there
      is no image request left to prioritise. */
  priority?: boolean;
}

/** Mark height per size token. The logotype is sized from the same step. */
const MARK: Record<"sm" | "md" | "lg", string> = {
  sm: "h-8",
  md: "h-9 lg:h-11",
  lg: "h-11 lg:h-13",
};

const NAME: Record<"sm" | "md" | "lg", string> = {
  sm: "text-[1.3rem]",
  md: "text-[1.45rem] lg:text-[1.8rem]",
  lg: "text-[1.8rem] lg:text-[2.1rem]",
};

export function Logo({
  tone = "dark",
  size = "md",
  className,
  asStatic,
  withTagline = false,
}: LogoProps) {
  const light = tone === "light";
  const lockup = (
    <span className="inline-flex items-center gap-2 lg:gap-2.5">
      {/* `w-auto` keeps the mark's aspect; the height classes drive the size. */}
      <BrandMark tone={tone} className={cn("w-auto shrink-0", MARK[size])} />

      {/* The logo artwork's lockup: heavy "Vidyant" in the ink, "IAS" in saffron. */}
      <span className={cn("inline-flex items-baseline gap-[0.22em] leading-none font-black tracking-[-0.03em]", NAME[size])}>
        <span style={{ color: light ? LOGO_HEX.cream : LOGO_HEX.navy }}>{BRAND.logotype.lead}</span>
        <span style={{ color: light ? LOGO_HEX.saffron : LOGO_HEX.saffronOnLight }}>{BRAND.logotype.trail}</span>
      </span>
    </span>
  );

  const artwork = withTagline ? (
    <span className={cn("inline-flex flex-col items-start gap-3", className)}>
      {lockup}
      <span
        className={cn(
          "flex items-center gap-2 text-[0.625rem] font-medium tracking-[0.2em] uppercase",
          light ? "text-white/80" : "text-ink-secondary",
        )}
      >
        <span aria-hidden className="h-0.5 w-4" style={{ background: LOGO_HEX.saffron }} />
        {LOGO_TAGLINE}
      </span>
    </span>
  ) : (
    <span className={cn("inline-flex", className)}>{lockup}</span>
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
