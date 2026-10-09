import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

interface BadgeProps extends ComponentProps<"span"> {
  tone?: "kesar" | "chilli" | "indigo" | "neutral" | "light" | "success";
}

const tones = {
  kesar: "bg-kesar-100 text-kesar-700",
  chilli: "bg-chilli-100 text-chilli-700",
  indigo: "bg-indigo text-white",
  neutral: "bg-paper text-ink-secondary",
  light: "text-white ring-1 ring-white/40",
  success: "bg-success-50 text-success",
} as const;

/** Square tags for categories, status and small labels — no pills. */
export function Badge({ tone = "kesar", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-eyebrow font-bold uppercase",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
