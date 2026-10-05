import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

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
  indigo: "bg-indigo text-white hover:bg-indigo-700",
  "indigo-dark": "bg-indigo-900 text-white hover:bg-indigo-700",
  kesar: "bg-kesar text-indigo-900 hover:bg-kesar-600 hover:text-white",
  paper: "bg-white text-indigo ring-1 ring-line hover:ring-indigo",
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
          "flex size-11 items-center justify-center rounded-md",
          href ? iconTones[tone] : "bg-paper-200 text-ink-secondary",
        )}
      >
        {icon}
      </span>

      <span className="mt-5 block text-body-lg font-semibold">{label}</span>

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
        // `mt-auto` pins the chip to the bottom of the tile, so tiles with a
        // one-line and a two-line description still line up.
        <span className="mt-auto self-start rounded-full bg-paper-200 px-3 py-1 text-eyebrow font-semibold uppercase text-ink-secondary">
          Not live yet
        </span>
      ) : null}
    </>
  );

  // `h-full` is what makes every tile in a row the same height: the grid item
  // already stretches, the tile has to take the height it is given.
  const shape =
    "flex h-full min-h-44 flex-col rounded-lg p-6 transition-[background-color,box-shadow,transform] duration-200 ease-[var(--ease-brand)]";

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
        "hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]",
      )}
    >
      {body}
    </Link>
  );
}
