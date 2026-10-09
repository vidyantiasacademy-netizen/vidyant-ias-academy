import {
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  Clock,
  IndianRupee,
  MapPin,
} from "lucide-react";

import { Section } from "@/components/layout/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TrackedButtonLink } from "@/components/ui/TrackedLink";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { nextOrientation } from "@/data/events";
import { BRAND, ROUTES } from "@/lib/constants/site";

const TOPICS = [
  "How the exam actually works",
  "The syllabus, minus the panic",
  "A plan you can stick to",
  "What to read, and what to skip",
  "Mistakes almost everyone makes",
];

function dateParts(iso: string) {
  const date = new Date(iso);
  const format = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-IN", options).format(date);
  return {
    day: format({ day: "numeric" }),
    month: format({ month: "short" }),
    weekday: format({ weekday: "long" }),
    full: format({ day: "numeric", month: "long", year: "numeric" }),
  };
}

/**
 * Lead-generation block for the free orientation: bold type, an eyebrow, a
 * numbered agenda and a ticket card, written for first-time aspirants in their early twenties.
 * When no orientation is scheduled yet, the ticket asks for interest instead of
 * displaying an invented date.
 */
export function OrientationSection() {
  const orientation = nextOrientation();
  const date = orientation ? dateParts(orientation.date) : null;

  const details = [
    {
      icon: Clock,
      label: "Time",
      value: orientation
        ? `${orientation.time} · ${orientation.durationMinutes} min`
        : "About 2 hours",
    },
    {
      icon: MapPin,
      label: "Venue",
      value: orientation?.location ?? `${BRAND.name}, ${BRAND.city}`,
    },
    { icon: IndianRupee, label: "Fee", value: orientation?.fee ?? "Free" },
  ];

  return (
    <Section tone="indigo" id="orientation" containerSize="wide">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
        <div className="border-t-2 border-white pt-5 lg:col-span-7">
          <Eyebrow tone="light">Free orientation · In person · {BRAND.city}</Eyebrow>

          <h2 className="mt-5 text-h2 font-bold text-white lg:text-h2-lg">
            UPSC feels huge.{" "}
            <span className="mt-1 block text-kesar">
              Let&rsquo;s make it make sense.
            </span>
          </h2>

          <p className="mt-5 max-w-[46ch] text-body text-white/80 sm:text-body-lg">
            One free session. No jargon, no sales pitch &ndash; just the whole
            exam, decoded before you spend a rupee or a year on it.
          </p>

          <p className="mt-8 text-eyebrow font-bold uppercase text-white/85">
            What you&rsquo;ll walk out knowing
          </p>
          <ol className="mt-3 grid sm:grid-cols-2 sm:gap-x-8">
            {TOPICS.map((topic, index) => (
              <li
                key={topic}
                className="flex items-baseline gap-4 border-t border-white/30 py-3 text-body font-medium text-white sm:last:col-span-2"
              >
                <span className="text-small font-bold tabular-nums text-kesar">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {topic}
              </li>
            ))}
          </ol>

          <TrackedButtonLink
            href={ROUTES.events}
            variant="outlineLight"
            size="md"
            event={ANALYTICS_EVENTS.eventRegister}
            payload={{ location: "home-orientation-secondary" }}
            className="mt-8"
          >
            See everything that&rsquo;s coming up
            <ArrowRight aria-hidden className="size-4" />
          </TrackedButtonLink>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
          <article
            aria-labelledby="orientation-ticket-title"
            className="overflow-hidden border-t-4 border-kesar bg-white text-ink"
          >
            <header className="flex items-center gap-5 p-6 sm:p-7">
              {date ? (
                <div className="grid w-18 shrink-0 place-items-center bg-indigo py-3 text-white">
                  <span className="text-eyebrow font-semibold uppercase text-white/85">
                    {date.month}
                  </span>
                  <span className="text-h2 font-bold leading-none">
                    {date.day}
                  </span>
                </div>
              ) : (
                <div className="grid size-18 shrink-0 place-items-center bg-indigo text-white">
                  <CalendarClock aria-hidden className="size-8" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-eyebrow font-semibold uppercase text-ink-secondary">
                  {date ? date.weekday : "Next session"}
                </p>
                <h3
                  id="orientation-ticket-title"
                  className="mt-1 text-h4 font-bold text-indigo"
                >
                  {date ? date.full : "Dropping soon"}
                </h3>
                {!date && (
                  <p className="mt-1 text-small text-ink-secondary">
                    The date isn&rsquo;t fixed yet. Get on the list and
                    you&rsquo;ll hear first.
                  </p>
                )}
              </div>
            </header>

            <div aria-hidden className="mx-6 border-t border-line sm:mx-7" />

            <dl className="divide-y divide-line px-6 sm:px-7">
              {details.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <dt className="flex items-center gap-3 text-small font-medium text-ink-secondary">
                    <span className="grid size-9 place-items-center border border-line">
                      <Icon aria-hidden className="size-4.5 text-indigo" />
                    </span>
                    {label}
                  </dt>
                  <dd className="text-right text-body font-bold text-indigo">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            <footer className="p-6 pt-4 sm:p-7 sm:pt-4">
              <TrackedButtonLink
                href={
                  orientation
                    ? `${ROUTES.events}#${orientation.slug}`
                    : ROUTES.events
                }
                variant="kesar"
                size="lg"
                fullWidth
                event={ANALYTICS_EVENTS.eventRegister}
                payload={{
                  location: "home-orientation",
                  event: orientation?.id ?? "interest",
                }}
              >
                {orientation ? "Save my seat" : "Count me in"}
                <ArrowUpRight aria-hidden className="size-5" />
              </TrackedButtonLink>
              <p className="mt-3 text-center text-small text-ink-secondary">
                {orientation?.seatsNote ??
                  "No fee, no spam. Just the date, once it\u2019s set."}
              </p>
            </footer>
          </article>
        </div>
      </div>
    </Section>
  );
}
