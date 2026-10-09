import type { ComponentProps } from "react";

import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils/cn";

interface SectionProps extends ComponentProps<"section"> {
  /** Background treatment. Keeps the 70/20/10 neutral-indigo-kesar balance. */
  tone?: "white" | "paper" | "indigo";
  containerSize?: "default" | "narrow" | "wide";
  /** Turn off the built-in container when a section needs full-bleed children. */
  bleed?: boolean;
  spacing?: "default" | "tight" | "none";
}

const tones = {
  white: "bg-white",
  paper: "bg-paper",
  indigo: "relative overflow-hidden bg-indigo text-white focus-invert",
} as const;

const spacings = {
  default: "py-12 sm:py-16 lg:py-20",
  tight: "py-10 sm:py-12 lg:py-16",
  none: "",
} as const;

export function Section({
  tone = "white",
  containerSize = "default",
  bleed = false,
  spacing = "default",
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      // Sections are anchor targets; keep them clear of the sticky header.
      className={cn(
        "scroll-mt-16 lg:scroll-mt-18",
        tones[tone],
        spacings[spacing],
        className,
      )}
      {...props}
    >
      {bleed ? (
        children
      ) : (
        <Container size={containerSize} className={tone === "indigo" ? "relative" : undefined}>
          {children}
        </Container>
      )}
    </section>
  );
}
