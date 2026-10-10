
import Link from "@/i18n/Link";
import { BRAND } from "@/lib/constants/site";
import { cn } from "@/lib/utils/cn";

import { SopanMark } from "./SopanMark";

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

/** Mark height per size token. The logotype is sized from the same step. */
const MARK: Record<"sm" | "md" | "lg", string> = {
  sm: "h-7",
  md: "h-8 lg:h-10",
  lg: "h-10 lg:h-12",
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
      {/* `w-auto` keeps the 64:50 aspect; the height classes drive the size. */}
      <SopanMark className={cn("w-auto shrink-0", MARK[size])} />

      {/* Bold "Vidyant", light "IAS", set tight in the sans — the deck's Sopan
          lockup. No saffron in the name: the top step is the only kesar. */}
      <span className={cn("inline-flex items-baseline leading-none tracking-[-0.02em]", NAME[size])}>
        <span className="font-bold">{BRAND.logotype.lead}</span>
        <span className="font-light">{BRAND.logotype.trail}</span>
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
