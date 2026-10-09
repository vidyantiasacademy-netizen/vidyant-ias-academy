
import Link from "@/i18n/Link";
import { BRAND } from "@/lib/constants/site";
import { cn } from "@/lib/utils/cn";

import { NibMark } from "./NibMark";

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

/** Nib height per size token. The logotype is sized from the same step. */
const MARK: Record<"sm" | "md" | "lg", string> = {
  sm: "h-8",
  md: "h-10 lg:h-12",
  lg: "h-12 lg:h-14",
};

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
        "inline-flex items-center gap-2.5 lg:gap-3",
        tone === "light" ? "text-white" : "text-indigo",
        className,
      )}
    >
      {/* `w-auto` keeps the 40:64 aspect; the height classes drive the size. */}
      <NibMark className={cn("w-auto shrink-0", MARK[size])} />

      {/* Serif "Vidyant" for the scholarship, spaced sans caps "IAS" for the
          service, joined by one kesar pen stroke under the whole word —
          hairline at the V, widening to a nib-cut end under IAS, the way a
          Kalam stroke lands. Colour comes from `tone`; the stroke is kesar on
          both, which holds on white and on indigo. */}
      <span className={cn("relative inline-flex items-baseline pb-[0.28em] leading-none", NAME[size])}>
        <span className="font-serif font-semibold tracking-[-0.015em]">
          {BRAND.logotype.lead}
        </span>
        <span className="ml-[0.14em] font-sans text-[0.74em] font-extrabold tracking-[0.12em]">
          {BRAND.logotype.trail}
        </span>
        <svg
          aria-hidden
          viewBox="0 0 200 8"
          preserveAspectRatio="none"
          className="pointer-events-none absolute bottom-0 left-[0.04em] h-[0.2em] w-[calc(100%-0.16em)] text-kesar"
        >
          <polygon points="0,7 150,2.2 200,0 193,8 0,8" fill="currentColor" />
        </svg>
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
