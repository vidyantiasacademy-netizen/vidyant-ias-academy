import type { ComponentProps } from "react";

import { Container } from "@/components/ui/Container";
import { KesarLines } from "@/components/ui/KesarLines";
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
  indigo: "relative overflow-hidden bg-indigo-gradient text-white focus-invert",
} as const;

const spacings = {
  default: "py-10 sm:py-12 lg:py-16",
  tight: "py-8 sm:py-10 lg:py-12",
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
        "scroll-mt-16 sm:scroll-mt-20 lg:scroll-mt-24",
        tones[tone],
        spacings[spacing],
        className,
      )}
      {...props}
    >
      {tone === "indigo" ? <KesarLines /> : null}
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
