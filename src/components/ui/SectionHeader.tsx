import type { ReactNode } from "react";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { cn } from "@/lib/utils/cn";

interface SectionHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  tone?: "dark" | "light";
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
  action,
  className,
  as: Heading = "h2",
}: SectionHeaderProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between",
        centered && "lg:flex-col lg:items-center",
        className,
      )}
    >
      <div
        className={cn(
          "max-w-2xl",
          centered && "mx-auto text-center",
        )}
      >
        {eyebrow ? (
          <Eyebrow
            tone={tone === "light" ? "light" : "kesar"}
            className={cn("mb-4", centered && "justify-center")}
          >
            {eyebrow}
          </Eyebrow>
        ) : null}
        <Heading
          className={cn(
            "text-h2 lg:text-h2-lg font-semibold",
            tone === "light" && "text-white",
          )}
        >
          {title}
        </Heading>
        {description ? (
          <p
            className={cn(
              "mt-4 text-body sm:text-body-lg",
              tone === "light" ? "text-white/75" : "text-ink-secondary",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
