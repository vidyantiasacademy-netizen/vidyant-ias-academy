import { cn } from "@/lib/utils/cn";

export type SocialIconName = "instagram" | "youtube" | "linkedin";

/**
 * Minimal line glyphs for social platforms. lucide-react no longer ships brand
 * icons, so these are drawn in the same 24px stroke style as the rest of the UI.
 */
export function SocialIcon({
  name,
  className,
}: {
  name: SocialIconName;
  className?: string;
}) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className: cn("size-4.5", className),
  };

  if (name === "instagram") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (name === "youtube") {
    return (
      <svg {...common}>
        <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
        <path d="M10.75 9.75 15.25 12l-4.5 2.25v-4.5Z" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M7.5 10.5v6.5" />
      <circle cx="7.5" cy="7.6" r="0.9" fill="currentColor" stroke="none" />
      <path d="M11.5 17v-6.5M11.5 13.2c0-1.5 1-2.4 2.3-2.4 1.4 0 2.2.9 2.2 2.6V17" />
    </svg>
  );
}
