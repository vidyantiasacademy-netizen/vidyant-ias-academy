import type { ReactNode } from "react";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { cn } from "@/lib/utils/cn";

interface SectionHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  tone?: "dark" | "light";
  /** Eyebrow colour on light surfaces; light-tone headers always use kesar. */
  accent?: "kesar" | "chilli";
  /** Rendered to the right of the heading on large screens. */
  action?: ReactNode;
  className?: string;
  /** Heading level — keeps the page outline correct. */
  as?: "h2" | "h3";
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "dark",
  accent = "kesar",
  action,
  className,
  as: Heading = "h2",
}: SectionHeaderProps) {
  const centered = align === "center";

  // Swiss header: a hard rule across the full measure, then an asymmetric
  // split — the eyebrow hangs in the left 3 of 12 columns, the heading takes
  // the rest, flush left. Centred headers keep the rule but stack.
  return (
    <div
      className={cn(
        "border-t-2 pt-5 lg:pt-6",
        tone === "light" ? "border-white" : "border-indigo",
        centered
          ? "flex flex-col items-center gap-4 text-center"
          : "grid gap-4 lg:grid-cols-12 lg:gap-x-8",
        className,
      )}
    >
      {eyebrow ? (
        <Eyebrow
          tone={tone === "light" ? "light" : accent}
          className={cn(!centered && "lg:col-span-3 lg:pt-2", centered && "justify-center")}
        >
          {eyebrow}
        </Eyebrow>
      ) : null}
      <div
        className={cn(
          "flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-8",
          !centered && (eyebrow ? "lg:col-span-9" : "lg:col-span-12"),
          centered && "lg:flex-col lg:items-center",
        )}
      >
        <div className={cn("max-w-3xl", centered && "mx-auto")}>
          <Heading
            className={cn(
              "text-h2 font-bold lg:text-h2-lg",
              tone === "light" && "text-white",
            )}
          >
            {title}
          </Heading>
          {description ? (
            <p
              className={cn(
                "mt-4 max-w-2xl text-body sm:text-body-lg",
                centered && "mx-auto",
                tone === "light" ? "text-white/80" : "text-ink-secondary",
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
