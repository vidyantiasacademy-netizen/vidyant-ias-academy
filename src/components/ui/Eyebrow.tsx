import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

interface EyebrowProps extends ComponentProps<"p"> {
  tone?: "kesar" | "chilli" | "indigo" | "light";
}

/* The label itself is always quiet ink (or white on a band); the tone only
   colours the square key, so one accent appears per label and never as text
   that has to carry contrast on its own. */
const tones = {
  kesar: { text: "text-ink-secondary", key: "bg-kesar" },
  chilli: { text: "text-ink-secondary", key: "bg-chilli" },
  indigo: { text: "text-ink-secondary", key: "bg-indigo" },
  light: { text: "text-white/85", key: "bg-kesar" },
} as const;

/** Small uppercase label that opens a section, keyed by a short vertical bar. */
export function Eyebrow({ tone = "kesar", className, children, ...props }: EyebrowProps) {
  return (
    <p
      className={cn(
        "flex items-center gap-2.5 text-eyebrow font-bold uppercase",
        tones[tone].text,
        className,
      )}
      {...props}
    >
      <span aria-hidden className={cn("h-4 w-1 shrink-0 rounded-full", tones[tone].key)} />
      {children}
    </p>
  );
}
