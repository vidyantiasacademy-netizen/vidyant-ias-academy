import { ChevronRight } from "lucide-react";

import Link from "@/i18n/Link";
import { cn } from "@/lib/utils/cn";

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({
  items,
  tone = "dark",
  className,
}: {
  items: Crumb[];
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-small">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={cn(
                    "transition-colors",
                    tone === "light"
                      ? "text-white/65 hover:text-kesar"
                      : "text-ink-secondary hover:text-indigo",
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={tone === "light" ? "text-white" : "text-indigo"}
                >
                  {item.label}
                </span>
              )}
              {!isLast ? (
                <ChevronRight
                  aria-hidden
                  className={cn(
                    "size-3.5",
                    tone === "light" ? "text-white/35" : "text-ink-muted",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
