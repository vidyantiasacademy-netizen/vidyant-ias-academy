import type { ComponentProps, ElementType } from "react";

import { cn } from "@/lib/utils/cn";

interface ContainerProps extends ComponentProps<"div"> {
  as?: ElementType;
  /** `wide` relaxes the reading width for full-bleed feature grids. */
  size?: "default" | "narrow" | "wide";
}

const sizes = {
  default: "max-w-[1200px]",
  narrow: "max-w-[820px]",
  wide: "max-w-[1280px]",
} as const;

export function Container({
  as: Tag = "div",
  size = "default",
  className,
  ...props
}: ContainerProps) {
  return (
    <Tag
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", sizes[size], className)}
      {...props}
    />
  );
}
