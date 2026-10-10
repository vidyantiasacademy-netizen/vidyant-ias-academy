import Image from "next/image";

import { getImage, IMAGES } from "@/lib/constants/images";
import { cn } from "@/lib/utils/cn";

interface PlaceholderVisualProps {
  imageKey: keyof typeof IMAGES;
  className?: string;
  /** Shown inside the designed placeholder until real photography lands. */
  label?: string;
  priority?: boolean;
  tone?: "indigo" | "paper";
  /** Position of the placeholder caption — keep clear of overlapping cards. */
  labelPosition?: "top" | "bottom";
}

/**
 * Renders the real photograph when `lib/constants/images` has one, otherwise a
 * designed brand placeholder. Layout is identical either way, so dropping in
 * real images later cannot shift the page.
 */
export function PlaceholderVisual({
  imageKey,
  className,
  label,
  priority = false,
  tone = "indigo",
  labelPosition = "bottom",
}: PlaceholderVisualProps) {
  const image = getImage(imageKey);

  if (image.src) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }

  const isIndigo = tone === "indigo";

  return (
    <div
      role="img"
      aria-label={image.alt}
      className={cn(
        "relative overflow-hidden border",
        isIndigo ? "border-indigo bg-indigo" : "border-line bg-paper",
        className,
      )}
    >
      <div aria-hidden className={cn("absolute inset-0", isIndigo && "grid-lines")} />

      {/* Abstract study composition on a hard grid: two sheets, ruled lines, a
          highlighted line and a progress bar — plus one Bauhaus pair. */}
      <svg
        aria-hidden
        viewBox="0 0 320 400"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full"
      >
        <g
          stroke={isIndigo ? "rgba(255,255,255,0.24)" : "rgb(29 36 112 / 0.24)"}
          strokeWidth="1.5"
          fill="none"
        >
          <rect x="44" y="96" width="150" height="196" />
          <rect x="120" y="140" width="150" height="196" />
          <path d="M60 128h118M60 148h96M60 168h118M60 188h72" />
        </g>
        <path d="M136 180h118M136 200h84" stroke="var(--color-kesar)" strokeWidth="2" fill="none" />
        <rect x="226" y="92" width="52" height="52" fill="var(--color-kesar)" />
        <circle cx="226" cy="144" r="18" fill="var(--color-chilli)" />
        <rect
          x="136"
          y="236"
          width="118"
          height="6"
          fill={isIndigo ? "rgba(255,255,255,0.16)" : "rgb(29 36 112 / 0.16)"}
        />
        <rect x="136" y="236" width="74" height="6" fill="var(--color-kesar)" />
      </svg>

      {label ? (
        <p
          className={cn(
            "absolute left-7 max-w-[62%] text-small font-medium",
            labelPosition === "top" ? "top-6" : "bottom-6",
            isIndigo ? "text-white/80" : "text-ink-secondary",
          )}
        >
          {label}
        </p>
      ) : null}
    </div>
  );
}
