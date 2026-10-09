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
        "flex flex-col items-start border-t-2 px-6 py-12 text-left sm:px-10 sm:py-14",
        tone === "dark"
          ? "border-white bg-white/5"
          : "border-indigo bg-paper",
        className,
      )}
    >
      {icon ? (
        <span
          className={cn(
            "mb-5 flex size-12 items-center justify-center",
            tone === "dark" ? "bg-kesar text-indigo-900" : "bg-indigo text-white",
          )}
        >
          {icon}
        </span>
      ) : null}
      <h3
        className={cn(
          "text-h4 font-bold tracking-tight",
          tone === "dark" ? "text-white" : "text-indigo",
        )}
      >
        {title}
      </h3>
      <p
        className={cn(
          "mt-3 max-w-xl text-body",
          tone === "dark" ? "text-white/80" : "text-ink-secondary",
        )}
      >
        {description}
      </p>
      {action ? <div className="mt-7">{action}</div> : null}
    </div>
  );
}
