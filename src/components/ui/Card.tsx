import type { ComponentProps, ElementType } from "react";

import { cn } from "@/lib/utils/cn";

interface CardProps extends ComponentProps<"div"> {
  as?: ElementType;
  tone?: "white" | "paper" | "indigo";
  /** Hover hardens the rule to indigo — use for linked cards only. */
  interactive?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const tones = {
  white: "bg-white border-line",
  paper: "bg-paper border-paper-200",
  indigo: "bg-indigo border-indigo text-white focus-invert",
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
        "border",
        tones[tone],
        paddings[padding],
        interactive &&
          "transition-colors duration-150 ease-[var(--ease-brand)] hover:border-indigo",
        className,
      )}
      {...props}
    />
  );
}
