import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import Link from "@/i18n/Link";
import { cn } from "@/lib/utils/cn";

export const buttonStyles = cva(
  [
    "inline-flex items-center justify-center gap-2 rounded-md font-semibold",
    "transition-[transform,background-color,border-color,color,box-shadow,filter] duration-200 ease-[var(--ease-brand)]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]",
    "disabled:pointer-events-none disabled:opacity-55",
    "active:translate-y-px",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-indigo-gradient text-white hover:brightness-125 hover:-translate-y-0.5 shadow-[0_1px_2px_rgb(11_63_49/0.18)]",
        secondary:
          "bg-white text-indigo border border-line-strong hover:border-indigo hover:-translate-y-0.5",
        kesar: "bg-kesar text-indigo-900 hover:bg-kesar-600 hover:text-white hover:-translate-y-0.5",
        outlineLight:
          "border border-white/30 text-white hover:bg-white/10 hover:border-white/60",
        ghost: "text-indigo hover:bg-paper",
        link: "text-indigo underline decoration-kesar decoration-2 underline-offset-4 hover:text-kesar-600",
      },
      size: {
        // Heights are thumb-sized: this site is used one-handed on a
        // phone far more often than with a mouse.
        sm: "h-10 px-4 text-small",
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
