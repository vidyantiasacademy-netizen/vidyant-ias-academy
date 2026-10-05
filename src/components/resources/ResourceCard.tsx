import { ArrowRight, Download, FileText } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { TrackedAnchor, TrackedLink } from "@/components/ui/TrackedLink";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { RESOURCE_TYPE_LABELS } from "@/data/resources";
import { ROUTES } from "@/lib/constants/site";
import { cn } from "@/lib/utils/cn";
import type { Resource } from "@/types";

export function ResourceCard({
  resource,
  className,
}: {
  resource: Resource;
  className?: string;
}) {
  const available = Boolean(resource.href);

  return (
    <Card
      as="article"
      id={resource.slug}
      interactive
      className={cn("flex h-full flex-col scroll-mt-28", className)}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex size-10 items-center justify-center rounded-md bg-paper text-kesar-600">
          <FileText aria-hidden className="size-5" />
        </span>
        <Badge tone="neutral">{RESOURCE_TYPE_LABELS[resource.type]}</Badge>
      </div>
      <h3 className="mt-5 text-h4 font-semibold">{resource.title}</h3>
      <p className="mt-3 flex-1 text-small text-ink-secondary">{resource.description}</p>

      {available ? (
        <TrackedAnchor
          href={resource.href}
          event={ANALYTICS_EVENTS.resourceDownload}
          payload={{ resource: resource.id }}
          className="group mt-6 inline-flex items-center gap-2 text-small font-semibold text-indigo transition-colors hover:text-kesar-600"
        >
          <Download aria-hidden className="size-4" />
          Download
        </TrackedAnchor>
      ) : (
        <TrackedLink
          href={`${ROUTES.resources}#${resource.slug}`}
          event={ANALYTICS_EVENTS.resourceDownload}
          payload={{ resource: resource.id, state: "request" }}
          className="group mt-6 inline-flex items-center gap-2 text-small font-semibold text-indigo transition-colors hover:text-kesar-600"
        >
          Request this resource
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform duration-200 ease-[var(--ease-brand)] group-hover:translate-x-1"
          />
        </TrackedLink>
      )}
    </Card>
  );
}
