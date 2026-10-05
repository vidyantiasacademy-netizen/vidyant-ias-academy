import { CalendarDays, Clock, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { TrackedButtonLink } from "@/components/ui/TrackedLink";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { ROUTES } from "@/lib/constants/site";
import { cn } from "@/lib/utils/cn";
import type { Event } from "@/types";

function formatEventDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function EventCard({ event, className }: { event: Event; className?: string }) {
  return (
    <Card as="article" className={cn("flex h-full flex-col", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="kesar">{event.fee}</Badge>
        <Badge tone="neutral">{event.mode}</Badge>
      </div>
      <h3 className="mt-4 text-h3 font-semibold">{event.title}</h3>
      <p className="mt-3 flex-1 text-body text-ink-secondary">{event.description}</p>

      <dl className="mt-6 grid gap-2.5 text-small text-ink-secondary">
        <div className="flex items-center gap-2.5">
          <CalendarDays aria-hidden className="size-4 text-kesar-600" />
          <dt className="sr-only">Date</dt>
          <dd>{formatEventDate(event.date)}</dd>
        </div>
        <div className="flex items-center gap-2.5">
          <Clock aria-hidden className="size-4 text-kesar-600" />
          <dt className="sr-only">Time</dt>
          <dd>
            {event.time} • {event.durationMinutes} minutes
          </dd>
        </div>
        <div className="flex items-center gap-2.5">
          <MapPin aria-hidden className="size-4 text-kesar-600" />
          <dt className="sr-only">Location</dt>
          <dd>{event.location}</dd>
        </div>
      </dl>

      {event.seatsNote ? (
        <p className="mt-4 text-small text-ink-muted">{event.seatsNote}</p>
      ) : null}

      <TrackedButtonLink
        href={`${ROUTES.events}#${event.slug}`}
        variant="primary"
        className="mt-7"
        event={ANALYTICS_EVENTS.eventRegister}
        payload={{ event: event.id, location: "event-card" }}
      >
        Reserve Your Seat
      </TrackedButtonLink>
    </Card>
  );
}
