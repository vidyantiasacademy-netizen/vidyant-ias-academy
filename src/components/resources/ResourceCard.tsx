import { ArrowRight, BookOpen, FileText, ShoppingBag } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { TrackedAnchor, TrackedLink } from "@/components/ui/TrackedLink";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { RESOURCE_TYPE_LABELS } from "@/data/resources";
import { BRAND, ROUTES, whatsappUrl } from "@/lib/constants/site";
import { cn } from "@/lib/utils/cn";
import type { Resource } from "@/types";

const RUPEES = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function ResourceCard({
  resource,
  className,
}: {
  resource: Resource;
  className?: string;
}) {
  const paid = resource.price !== null;

  return (
    <Card
      as="article"
      id={resource.slug}
      interactive
      className={cn("flex h-full flex-col scroll-mt-28", className)}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-kesar-100 text-kesar-600">
          <FileText aria-hidden className="size-5" />
        </span>
        <span className="flex gap-1.5">
          {paid ? <Badge tone="chilli">Premium</Badge> : <Badge tone="success">Free</Badge>}
          {/* Resources are read on the site, not downloaded — no "PDF" label. */}
          {resource.type !== "pdf" ? (
            <Badge tone="neutral">{RESOURCE_TYPE_LABELS[resource.type]}</Badge>
          ) : null}
        </span>
      </div>
      <h3 className="mt-5 text-h4 font-bold">{resource.title}</h3>
      <p className="mt-3 flex-1 text-small text-ink-secondary">{resource.description}</p>
      {resource.pages ? (
        <p className="mt-3 text-small text-ink-muted">{resource.pages} pages</p>
      ) : null}

      {paid ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <span className="text-h4 font-bold tabular-nums text-indigo">
            {RUPEES.format(resource.price!)}
          </span>
          {/* Paid material is ordered on WhatsApp and delivered after payment,
              until it has an online checkout of its own. */}
          <TrackedAnchor
            href={whatsappUrl(
              `Hi ${BRAND.name}, I would like to buy "${resource.title}" (${RUPEES.format(resource.price!)}).`,
            )}
            target="_blank"
            rel="noreferrer"
            event={ANALYTICS_EVENTS.resourceBuyClick}
            payload={{ resource: resource.id, price: resource.price }}
            className="inline-flex h-10 items-center gap-2 bg-indigo px-4 text-small font-bold text-white transition-colors hover:bg-indigo-900"
          >
            <ShoppingBag aria-hidden className="size-4" />
            Buy now
          </TrackedAnchor>
        </div>
      ) : resource.readHref ? (
        <TrackedLink
          href={resource.readHref}
          event={ANALYTICS_EVENTS.resourceOpen}
          payload={{ resource: resource.id }}
          className="group mt-6 inline-flex items-center gap-2 text-small font-semibold text-indigo transition-colors hover:text-indigo-900 hover:underline underline-offset-4"
        >
          <BookOpen aria-hidden className="size-4" />
          Read now
        </TrackedLink>
      ) : (
        <TrackedLink
          href={`${ROUTES.resources}#${resource.slug}`}
          event={ANALYTICS_EVENTS.resourceDownload}
          payload={{ resource: resource.id, state: "request" }}
          className="group mt-6 inline-flex items-center gap-2 text-small font-semibold text-indigo transition-colors hover:text-indigo-900 hover:underline underline-offset-4"
        >
          Request this resource
          <ArrowRight
            aria-hidden
            className="size-4"
          />
        </TrackedLink>
      )}
    </Card>
  );
}
