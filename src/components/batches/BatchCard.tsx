import { CalendarDays, Clock, IndianRupee, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { TrackedButtonLink } from "@/components/ui/TrackedLink";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { CTA, ROUTES } from "@/lib/constants/site";
import { cn } from "@/lib/utils/cn";
import type { Batch } from "@/types";

export function formatBatchDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function BatchCard({ batch, className }: { batch: Batch; className?: string }) {
  const details = [
    { icon: CalendarDays, label: "Starts", value: formatBatchDate(batch.startDate) },
    { icon: Clock, label: "Schedule", value: batch.schedule },
    { icon: MapPin, label: "Mode", value: `${batch.mode} • ${batch.location}` },
    { icon: IndianRupee, label: "Fee", value: batch.fee },
  ];

  return (
    <Card as="article" className={cn("flex h-full flex-col", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="indigo">{batch.mode}</Badge>
        {batch.highlight ? <Badge tone="kesar">{batch.highlight}</Badge> : null}
      </div>

      <h3 className="mt-4 text-h4 font-bold">{batch.title}</h3>
      <p className="mt-2 text-small text-ink-secondary">{batch.duration}</p>

      <dl className="mt-6 grid flex-1 gap-3 text-small">
        {details.map(({ icon: Icon, label, value }) => (
          <div key={label} className="grid grid-cols-[1.25rem_1fr] items-start gap-x-2.5">
            <Icon aria-hidden className="mt-0.5 size-4 text-kesar-600" />
            <dt className="sr-only">{label}</dt>
            <dd className="text-ink-secondary">{value}</dd>
          </div>
        ))}
      </dl>

      {batch.seatsNote ? (
        <p className="mt-4 text-small text-ink-muted">{batch.seatsNote}</p>
      ) : null}

      <TrackedButtonLink
        href={`${ROUTES.enrol}#enrolment-form`}
        variant="primary"
        className="mt-7"
        event={ANALYTICS_EVENTS.enrolClick}
        payload={{ batch: batch.id, course: batch.courseId, location: "batch-card" }}
      >
        {CTA.enrol.label}
      </TrackedButtonLink>
    </Card>
  );
}
