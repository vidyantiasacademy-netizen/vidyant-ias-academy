import { CalendarClock } from "lucide-react";

import { BatchCard } from "@/components/batches/BatchCard";
import { Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { upcomingBatches } from "@/data/batches";
import { CTA, EXAM_CYCLE } from "@/lib/constants/site";

/**
 * Upcoming batches — the first thing an aspirant who has already decided looks
 * for. Until a start date is confirmed the block asks for a callback instead of
 * displaying an invented calendar.
 */
export function BatchesSection() {
  const batches = upcomingBatches().slice(0, 3);

  return (
    <Section tone="paper" id="batches" containerSize="wide">
      <SectionHeader
        eyebrow="Upcoming Batches"
        title={`Batches open for ${EXAM_CYCLE.label}.`}
        description="Start dates, timings and the mode of attendance for every batch currently taking admissions. Seats are confirmed on a call, so nothing is held back for a form."
        action={
          <ButtonLink href={CTA.enrol.href} variant="secondary">
            Admissions & batch calendar
          </ButtonLink>
        }
      />

      {batches.length > 0 ? (
        <ul className="mt-7 grid gap-4 md:grid-cols-2 lg:mt-9 lg:grid-cols-3 lg:gap-5">
          {batches.map((batch) => (
            <li key={batch.id}>
              <BatchCard batch={batch} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          className="mt-8"
          icon={<CalendarClock aria-hidden className="size-5" />}
          title="The next batch calendar is being finalised"
          description="Rather than publish a date we cannot keep, we will tell you the moment it is confirmed. Ask for a callback and our academic team will walk you through the programme, the timings and the fee structure."
          action={
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="#callback" variant="primary">
                {CTA.callback.label}
              </ButtonLink>
              <ButtonLink href={CTA.counselling.href} variant="secondary">
                {CTA.counselling.label}
              </ButtonLink>
            </div>
          }
        />
      )}
    </Section>
  );
}
