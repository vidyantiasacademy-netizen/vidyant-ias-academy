import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

interface EyebrowProps extends ComponentProps<"p"> {
  tone?: "kesar" | "indigo" | "light";
}

const tones = {
  kesar: "text-kesar-600",
  indigo: "text-indigo",
  light: "text-kesar",
} as const;

/** Small uppercase label that opens a section. */
export function Eyebrow({ tone = "kesar", className, children, ...props }: EyebrowProps) {
  return (
    <p
      className={cn(
        "flex items-center gap-2.5 text-eyebrow font-semibold uppercase",
        tones[tone],
        className,
      )}
      {...props}
    >
      <span aria-hidden className="h-px w-6 bg-current opacity-60" />
      {children}
    </p>
  );
}
