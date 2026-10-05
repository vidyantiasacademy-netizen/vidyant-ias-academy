import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
  tone?: "light" | "dark";
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  tone = "light",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-lg border border-dashed px-6 py-12 text-center sm:px-10 sm:py-14",
        tone === "dark"
          ? "border-white/20 bg-white/5"
          : "border-line-strong bg-paper/60",
        className,
      )}
    >
      {icon ? (
        <span
          className={cn(
            "mb-5 flex size-12 items-center justify-center rounded-full",
            tone === "dark" ? "bg-white/10 text-kesar" : "bg-white text-kesar-600",
          )}
        >
          {icon}
        </span>
      ) : null}
      <h3
        className={cn(
          "text-h4 font-semibold",
          tone === "dark" ? "text-white" : "text-indigo",
        )}
      >
        {title}
      </h3>
      <p
        className={cn(
          "mt-3 max-w-xl text-body",
          tone === "dark" ? "text-white/70" : "text-ink-secondary",
        )}
      >
        {description}
      </p>
      {action ? <div className="mt-7">{action}</div> : null}
    </div>
  );
}
