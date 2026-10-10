import { useId } from "react";

import { cn } from "@/lib/utils/cn";

export type SocialIconName = "instagram" | "youtube" | "linkedin" | "whatsapp";

/**
 * Full-colour brand marks for social platforms. lucide-react no longer ships
 * brand icons, so these are drawn inline: each is a self-contained badge in
 * the network's own colour, so it reads the same on white, paper and indigo.
 */
export function SocialIcon({
  name,
  className,
}: {
  name: SocialIconName;
  className?: string;
}) {
  // Instagram's gradient needs a document-unique id; React's ids carry
  // characters that are awkward inside `url(#…)`, so keep only safe ones.
  const gradientId = `ig-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const common = {
    viewBox: "0 0 24 24",
    "aria-hidden": true,
    className: cn("size-5", className),
  };

  if (name === "instagram") {
    return (
      <svg {...common}>
        <defs>
          <radialGradient id={gradientId} cx="0.3" cy="1.07" r="1.2">
            <stop offset="0" stopColor="#fdf497" />
            <stop offset="0.1" stopColor="#fdf497" />
            <stop offset="0.5" stopColor="#fd5949" />
            <stop offset="0.68" stopColor="#d6249f" />
            <stop offset="1" stopColor="#285aeb" />
          </radialGradient>
        </defs>
        <rect x="1" y="1" width="22" height="22" rx="6" fill={`url(#${gradientId})`} />
        <g fill="none" stroke="#fff" strokeWidth="1.8">
          <rect x="5.5" y="5.5" width="13" height="13" rx="3.8" />
          <circle cx="12" cy="12" r="3.1" />
        </g>
        <circle cx="16" cy="8" r="0.95" fill="#fff" />
      </svg>
    );
  }

  if (name === "youtube") {
    return (
      <svg {...common}>
        <rect x="1" y="4" width="22" height="16" rx="4.5" fill="#ff0000" />
        <path d="M9.75 8.5v7l6-3.5-6-3.5Z" fill="#fff" />
      </svg>
    );
  }

  if (name === "whatsapp") {
    return (
      <svg {...common}>
        <path
          d="M12 1.5a10.5 10.5 0 0 0-9.05 15.82L1.5 22.5l5.33-1.4A10.5 10.5 0 1 0 12 1.5Z"
          fill="#25d366"
        />
        <path
          d="M9.1 6.9c-.2-.45-.42-.46-.61-.47h-.53a1 1 0 0 0-.73.34 3.06 3.06 0 0 0-.96 2.28 5.3 5.3 0 0 0 1.12 2.82 11.2 11.2 0 0 0 4.68 4.13c2.31.91 2.78.73 3.28.68a2.76 2.76 0 0 0 1.84-1.3 2.28 2.28 0 0 0 .16-1.3c-.07-.11-.25-.18-.53-.32s-1.66-.82-1.92-.91-.44-.14-.63.14-.73.91-.89 1.1-.33.21-.6.07a7.55 7.55 0 0 1-2.22-1.37 8.3 8.3 0 0 1-1.54-1.91c-.16-.28 0-.43.12-.57s.28-.33.42-.49a1.9 1.9 0 0 0 .28-.46.51.51 0 0 0 0-.49c-.07-.14-.61-1.52-.86-2.08Z"
          fill="#fff"
        />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="1" y="1" width="22" height="22" rx="3.5" fill="#0a66c2" />
      <g fill="#fff">
        <rect x="5.6" y="9.6" width="2.8" height="8.6" />
        <circle cx="7" cy="6.6" r="1.65" />
        <path d="M10.6 9.6h2.7v1.2a3.1 3.1 0 0 1 2.75-1.42c2.6 0 3.2 1.7 3.2 3.95v4.87h-2.8v-4.3c0-1.03-.02-2.33-1.43-2.33s-1.64 1.1-1.64 2.25v4.38h-2.8Z" />
      </g>
    </svg>
  );
}
