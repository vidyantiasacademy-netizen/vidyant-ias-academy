import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

interface BadgeProps extends ComponentProps<"span"> {
  tone?: "kesar" | "indigo" | "neutral" | "light" | "success";
}

const tones = {
  kesar: "bg-kesar-100 text-kesar-700",
  indigo: "bg-indigo text-white",
  neutral: "bg-paper text-ink-secondary",
  light: "bg-white/10 text-white ring-1 ring-white/20",
  success: "bg-success-50 text-success",
} as const;

/** Pills are reserved for tags, categories, status and small labels. */
export function Badge({ tone = "kesar", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-eyebrow font-semibold uppercase",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
