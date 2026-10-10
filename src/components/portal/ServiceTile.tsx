import type { ComponentProps, ReactNode } from "react";

import Link from "@/i18n/Link";
import { cn } from "@/lib/utils/cn";

/**
 * One block in the services grid.
 *
 * Colour sits in whole blocks rather than in trim, and exactly one tile on the
 * page carries kesar — the rest alternate indigo and paper. A saffron grid
 * would read as a different brand.
 *
 * A tile with no `href` is a service the institute has not switched on yet. It
 * renders as a muted, non-interactive block rather than a link, because a tile
 * that looks tappable and goes nowhere is worse than one that says so.
 */

export type ServiceTone = "indigo" | "indigo-dark" | "kesar" | "paper";

const tones: Record<ServiceTone, string> = {
  indigo: "bg-indigo text-white hover:bg-indigo-900",
  "indigo-dark": "bg-indigo-900 text-white hover:bg-indigo",
  kesar: "bg-kesar text-indigo-900 hover:bg-kesar-600 hover:text-white",
  paper: "bg-white text-indigo border-2 border-line hover:border-indigo",
};

const iconTones: Record<ServiceTone, string> = {
  indigo: "bg-white/12 text-white",
  "indigo-dark": "bg-white/12 text-white",
  kesar: "bg-indigo-900/10 text-indigo-900",
  paper: "bg-paper text-kesar-600",
};

export interface ServiceTileProps {
  label: string;
  description: string;
  icon: ReactNode;
  tone?: ServiceTone;
  /** Omit for a service that is not live yet. */
  href?: ComponentProps<typeof Link>["href"];
}

export function ServiceTile({
  label,
  description,
  icon,
  tone = "indigo",
  href,
}: ServiceTileProps) {
  const body = (
    <>
      <span
        className={cn(
          "flex size-11 items-center justify-center",
          href ? iconTones[tone] : "bg-paper-200 text-ink-secondary",
        )}
      >
        {icon}
      </span>

      <span className="mt-5 block text-body-lg font-bold">{label}</span>

      <span
        className={cn(
          "mt-1.5 block text-small",
          !href && "text-ink-secondary",
          href && (tone === "paper" ? "text-ink-secondary" : "opacity-85"),
        )}
      >
        {description}
      </span>

      {!href ? (
        // `mt-auto` pins the tag to the bottom of the tile, so tiles with a
        // one-line and a two-line description still line up.
        <span className="mt-auto self-start bg-paper-200 px-3 py-1 text-eyebrow font-semibold uppercase text-ink-secondary">
          Not live yet
        </span>
      ) : null}
    </>
  );

  // `h-full` is what makes every tile in a row the same height: the grid item
  // already stretches, the tile has to take the height it is given.
  const shape =
    "flex h-full min-h-44 flex-col p-6 transition-colors duration-200 ease-[var(--ease-brand)]";

  if (!href) {
    return (
      <div className={cn(shape, "border border-dashed border-line-strong bg-paper/60")}>
        {body}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        shape,
        tones[tone],
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]",
      )}
    >
      {body}
    </Link>
  );
}
