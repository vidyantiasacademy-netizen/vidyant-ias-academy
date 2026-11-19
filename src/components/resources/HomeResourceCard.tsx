import { ArrowRight, BookOpen, Download, ShoppingBag } from "lucide-react";

import { ResourceIllustration, sceneFor } from "@/components/resources/ResourceIllustration";
import { Badge } from "@/components/ui/Badge";
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

const PILL =
  "inline-flex h-11 w-fit items-center gap-2 rounded-full bg-indigo px-5 text-small font-bold text-white transition-colors hover:bg-kesar hover:text-indigo-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]";

/**
 * Homepage resource tile: the same facts and actions as `ResourceCard`
 * (Free/Premium and type badges, description, page count; Read now, Download, Buy now
 * or Request) in the illustrated layout — kesar-keyed title, navy pill
 * action, a small desk illustration in the corner.
 */
export function HomeResourceCard({ resource, className }: { resource: Resource; className?: string }) {
  const available = Boolean(resource.href);
  const paid = resource.price !== null;

  return (
    <article
      id={`home-${resource.slug}`}
      className={cn(
        "group relative isolate flex min-h-[15rem] flex-col overflow-hidden rounded-[1.25rem] border border-line/70 p-6 sm:p-7",
        "bg-[linear-gradient(120deg,#fff_0%,#fff_45%,var(--color-paper)_100%)] shadow-soft",
        "transition-shadow duration-200 hover:shadow-soft-hover",
        className,
      )}
    >
      <ResourceIllustration
        scene={sceneFor(resource)}
        className="absolute -right-3 -bottom-2 -z-10 w-[46%] max-w-[13rem] transition-transform duration-300 ease-[var(--ease-brand)] group-hover:-translate-y-1"
      />

      <span className="flex flex-wrap gap-1.5">
        {paid ? <Badge tone="chilli">Premium</Badge> : <Badge tone="success">Free</Badge>}
        <Badge tone="neutral">{RESOURCE_TYPE_LABELS[resource.type]}</Badge>
      </span>

      <h3 className="mt-4 flex gap-3 font-display text-h4 leading-tight font-bold text-indigo">
        <span aria-hidden className="mt-1 h-6 w-1 shrink-0 rounded-full bg-kesar" />
        {resource.title}
      </h3>
      {resource.description ? (
        <p className="mt-3 max-w-[60%] text-small text-ink-secondary">{resource.description}</p>
      ) : null}
      {resource.pages ? (
        <p className="mt-2 text-small text-ink-muted">{resource.pages} pages</p>
      ) : null}

      <div aria-hidden className="min-h-5 flex-1" />

      {paid ? (
        <div className="flex flex-wrap items-center gap-3">
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
            className={PILL}
          >
            <ShoppingBag aria-hidden className="size-4" />
            Buy now
          </TrackedAnchor>
          <span className="text-h4 font-bold tabular-nums text-indigo">
            {RUPEES.format(resource.price!)}
          </span>
        </div>
      ) : resource.readHref ? (
        <TrackedLink
          href={resource.readHref}
          event={ANALYTICS_EVENTS.resourceOpen}
          payload={{ resource: resource.id }}
          className={PILL}
        >
          <BookOpen aria-hidden className="size-4" />
          Read now
        </TrackedLink>
      ) : available ? (
        <TrackedAnchor
          href={resource.href}
          event={ANALYTICS_EVENTS.resourceDownload}
          payload={{ resource: resource.id }}
          className={PILL}
        >
          <Download aria-hidden className="size-4" />
          Download
        </TrackedAnchor>
      ) : (
        <TrackedLink
          href={`${ROUTES.resources}#${resource.slug}`}
          event={ANALYTICS_EVENTS.resourceDownload}
          payload={{ resource: resource.id, state: "request" }}
          className={PILL}
        >
          Request this resource
          <ArrowRight aria-hidden className="size-4" />
        </TrackedLink>
      )}
    </article>
  );
}
