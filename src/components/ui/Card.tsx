import type { ComponentProps, ElementType } from "react";

import { cn } from "@/lib/utils/cn";

interface CardProps extends ComponentProps<"div"> {
  as?: ElementType;
  tone?: "white" | "paper" | "indigo";
  /** Adds a subtle lift on hover — use for linked cards only. */
  interactive?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const tones = {
  white: "bg-white border-line",
  paper: "bg-paper border-paper-200",
  indigo: "bg-indigo-gradient border-white/10 text-white focus-invert",
} as const;

const paddings = {
  none: "",
  sm: "p-5",
  md: "p-6 sm:p-7",
  lg: "p-7 sm:p-9",
} as const;

export function Card({
  as: Tag = "div",
  tone = "white",
  interactive = false,
  padding = "md",
  className,
  ...props
}: CardProps) {
  return (
    <Tag
      className={cn(
        "rounded-lg border",
        tones[tone],
        paddings[padding],
        interactive &&
          "transition-[box-shadow,border-color,transform] duration-200 ease-[var(--ease-brand)] hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[var(--shadow-card-hover)]",
        className,
      )}
      {...props}
    />
  );
}
