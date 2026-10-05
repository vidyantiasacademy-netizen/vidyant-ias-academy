import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import type { CurrentAffair } from "@/types";

export function CurrentAffairCard({
  item,
  className,
}: {
  item: CurrentAffair;
  className?: string;
}) {
  return (
    <Card as="article" interactive className={cn("flex h-full flex-col", className)}>
      <p className="text-eyebrow font-semibold uppercase text-kesar-600">{item.subject}</p>
      <h3 className="mt-3 text-h4 font-semibold">
        <Link
          href={`/current-affairs/${item.slug}`}
          className="transition-colors hover:text-kesar-600"
        >
          {item.title}
        </Link>
      </h3>
      <p className="mt-3 flex-1 text-small text-ink-secondary">{item.whyItMatters}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {item.relevance.map((stage) => (
          <Badge key={stage} tone="neutral">
            {stage}
          </Badge>
        ))}
      </div>
      <Link
        href={`/current-affairs/${item.slug}`}
        className="group mt-6 inline-flex items-center gap-2 text-small font-semibold text-indigo transition-colors hover:text-kesar-600"
      >
        Read Analysis
        <ArrowRight
          aria-hidden
          className="size-4 transition-transform duration-200 ease-[var(--ease-brand)] group-hover:translate-x-1"
        />
      </Link>
    </Card>
  );
}
