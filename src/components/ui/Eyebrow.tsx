import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

interface EyebrowProps extends ComponentProps<"p"> {
  tone?: "kesar" | "chilli" | "indigo" | "light";
}

const tones = {
  kesar: "text-kesar-600",
  chilli: "text-chilli-600",
  indigo: "text-indigo",
  light: "text-kesar",
} as const;

/** Small uppercase label that opens a section, keyed by a solid square. */
export function Eyebrow({ tone = "kesar", className, children, ...props }: EyebrowProps) {
  return (
    <p
      className={cn(
        "flex items-center gap-2.5 text-eyebrow font-bold uppercase",
        tones[tone],
        className,
      )}
      {...props}
    >
      <span aria-hidden className="size-2 shrink-0 bg-current" />
      {children}
    </p>
  );
}
