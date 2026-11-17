import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import Link from "@/i18n/Link";
import { cn } from "@/lib/utils/cn";

export const buttonStyles = cva(
  [
    "inline-flex items-center justify-center gap-2 font-bold tracking-[-0.005em]",
    "transition-[background-color,border-color,color] duration-150 ease-[var(--ease-brand)]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]",
    "disabled:pointer-events-none disabled:opacity-55",
  ],
  {
    variants: {
      variant: {
        // Flat blocks, square corners, 2px rules. Hover inverts or steps the
        // fill — nothing lifts, glows or casts a shadow.
        primary: "bg-indigo text-white hover:bg-indigo-900",
        secondary:
          "bg-white text-indigo border-2 border-indigo hover:bg-indigo hover:text-white",
        kesar: "bg-kesar text-indigo-900 hover:bg-indigo-900 hover:text-kesar",
        outlineLight:
          "border-2 border-white text-white hover:bg-white hover:text-indigo",
        ghost: "text-indigo hover:bg-paper",
        link: "text-indigo underline decoration-kesar decoration-2 underline-offset-4 hover:decoration-indigo",
      },
      size: {
        // Heights are thumb-sized: this site is used one-handed on a
        // phone far more often than with a mouse.
        sm: "h-11 px-4 text-small",
        md: "h-12 px-5 text-small sm:text-body",
        lg: "h-14 px-6 text-body",
      },
      fullWidth: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "primary", size: "md", fullWidth: false },
  },
);

export type ButtonVariants = VariantProps<typeof buttonStyles>;

export function Button({
  className,
  variant,
  size,
  fullWidth,
  type = "button",
  ...props
}: ComponentProps<"button"> & ButtonVariants) {
  return (
    <button
      type={type}
      className={cn(buttonStyles({ variant, size, fullWidth }), className)}
      {...props}
    />
  );
}

export function ButtonLink({
  className,
  variant,
  size,
  fullWidth,
  ...props
}: ComponentProps<typeof Link> & ButtonVariants) {
  return (
    <Link
      className={cn(buttonStyles({ variant, size, fullWidth }), className)}
      {...props}
    />
  );
}
