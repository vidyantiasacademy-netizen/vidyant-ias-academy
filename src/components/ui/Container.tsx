import type { ComponentProps, ElementType } from "react";

import { cn } from "@/lib/utils/cn";

interface ContainerProps extends ComponentProps<"div"> {
  as?: ElementType;
  /** `wide` relaxes the reading width for full-bleed feature grids. */
  size?: "default" | "narrow" | "wide";
}

/* One page measure, shared by the header, every section and the footer, so
   their left edges line up down the whole page. It steps up on large screens
   so a 1920px or 2K display isn't mostly margin. `wide` is kept as an alias for
   existing callers; narrow is a reading measure and stays put. */
const PAGE = "max-w-[1280px] 2xl:max-w-[1440px] 3xl:max-w-[1760px] 4xl:max-w-[2160px]";

const sizes = {
  default: PAGE,
  narrow: "max-w-[820px]",
  wide: PAGE,
} as const;

export function Container({
  as: Tag = "div",
  size = "default",
  className,
  ...props
}: ContainerProps) {
  return (
    <Tag
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8 3xl:px-12", sizes[size], className)}
      {...props}
    />
  );
}
