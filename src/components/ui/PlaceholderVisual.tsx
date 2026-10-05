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
      <div className={cn("relative overflow-hidden rounded-xl", className)}>
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
        "relative overflow-hidden rounded-xl border",
        isIndigo ? "border-white/12 bg-indigo-900" : "border-paper-200 bg-paper",
        className,
      )}
    >
      <div
        aria-hidden
        className={cn(
          "absolute inset-0",
          isIndigo
            ? "bg-[radial-gradient(120%_90%_at_18%_0%,var(--color-indigo-700)_0%,var(--color-indigo)_55%,var(--color-indigo-950)_100%)]"
            : "bg-[radial-gradient(120%_90%_at_18%_0%,var(--color-white)_0%,var(--color-paper-200)_70%)]",
        )}
      />
      <div aria-hidden className={cn("absolute inset-0", isIndigo && "grid-lines")} />

      {/* Abstract study composition: notes, a highlighted line, a progress bar. */}
      <svg
        aria-hidden
        viewBox="0 0 320 400"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full"
      >
        <g
          stroke={isIndigo ? "rgba(255,255,255,0.16)" : "rgb(29 36 112 / 0.16)"}
          strokeWidth="1.2"
          fill="none"
        >
          <rect x="44" y="96" width="150" height="196" rx="8" />
          <rect x="120" y="140" width="150" height="196" rx="8" />
          <path d="M60 128h118M60 148h96M60 168h118M60 188h72" />
        </g>
        <g stroke="var(--color-kesar)" strokeWidth="1.4" fill="none" opacity="0.85">
          <path d="M136 180h118M136 200h84" />
          <circle cx="252" cy="118" r="26" opacity="0.5" />
        </g>
        <rect
          x="136"
          y="236"
          width="118"
          height="6"
          rx="3"
          fill={isIndigo ? "rgba(255,255,255,0.12)" : "rgb(29 36 112 / 0.12)"}
        />
        <rect x="136" y="236" width="74" height="6" rx="3" fill="var(--color-kesar)" opacity="0.9" />
      </svg>

      {label ? (
        <p
          className={cn(
            "absolute left-7 max-w-[62%] text-small font-medium",
            labelPosition === "top" ? "top-6" : "bottom-6",
            isIndigo ? "text-white/55" : "text-ink-secondary",
          )}
        >
          {label}
        </p>
      ) : null}
    </div>
  );
}
