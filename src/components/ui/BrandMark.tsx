import { useId } from "react";

import { LOGO_HEX, MARK_BLADE, MARK_DISC, MARK_V, MARK_VIEWBOX } from "@/lib/brand/mark";

interface BrandMarkProps {
  /** `dark` (navy disc) for light surfaces, `light` (cream disc) for dark ones. */
  tone?: "dark" | "light";
  className?: string;
  /** Mark-only usage outside a labelled control — otherwise stays decorative. */
  title?: string;
}

/**
 * The VidyantIAS mark: a V cut out of a disc, a saffron blade breaking out of
 * its right arm. The V is masked out, so it always shows the surface behind.
 */
export function BrandMark({ tone = "dark", className, title }: BrandMarkProps) {
  const mask = `vi-mark-${useId().replace(/:/g, "")}`;
  const { width, height } = MARK_VIEWBOX;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      <mask id={mask} maskUnits="userSpaceOnUse" x="0" y="0" width={width} height={height}>
        <circle {...MARK_DISC} fill="#fff" />
        <path d={MARK_V} fill="#000" />
      </mask>
      <circle {...MARK_DISC} fill={tone === "dark" ? LOGO_HEX.navy : LOGO_HEX.cream} mask={`url(#${mask})`} />
      <path d={MARK_BLADE} fill={tone === "dark" ? LOGO_HEX.saffronOnLight : LOGO_HEX.saffron} />
    </svg>
  );
}
