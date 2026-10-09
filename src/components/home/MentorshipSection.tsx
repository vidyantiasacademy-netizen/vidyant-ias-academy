import {
  CalendarClock,
  ClipboardList,
  MessageSquareQuote,
  Target,
  TrendingUp,
  UserRoundCheck,
} from "lucide-react";

import { Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PlaceholderVisual } from "@/components/ui/PlaceholderVisual";
import { ROUTES } from "@/lib/constants/site";

const FEATURES = [
  {
    icon: UserRoundCheck,
    label: "Personal mentor",
    note: "One person who knows your preparation.",
  },
  {
    icon: Target,
    label: "Goal setting",
    note: "Weekly targets you can actually finish.",
  },
  {
    icon: TrendingUp,
    label: "Progress reviews",
    note: "Periodic reviews against your plan.",
  },
  {
    icon: ClipboardList,
    label: "Test analysis",
    note: "Why marks were lost, not just how many.",
  },
  {
    icon: CalendarClock,
    label: "Study planning",
    note: "A sequence that fits your hours.",
  },
  {
    icon: MessageSquareQuote,
    label: "Doubt resolution",
    note: "Answers before doubts pile up.",
  },
];

export function MentorshipSection() {
  return (
    <Section tone="paper" id="mentorship" containerSize="wide">
      {/* Image in 5 of 12 columns, copy in 7: the promise and its six parts
          carry the section, the artwork supports it. */}
      <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-x-8">
        <PlaceholderVisual
          imageKey="mentorshipSession"
          tone="paper"
          className="order-last mx-auto aspect-4/5 w-full max-w-md border border-line lg:order-first lg:col-span-5 lg:max-w-none"
        />

        <div className="lg:col-span-7 lg:pl-4 xl:pl-8">
          <div className="border-t-2 border-indigo pt-5 lg:pt-6">
            <Eyebrow>Mentorship</Eyebrow>
          </div>
          <h2 className="mt-4 text-h2 font-bold lg:text-h2-lg">
            You shouldn&apos;t have to prepare alone.
          </h2>
          <p className="mt-5 max-w-[60ch] text-body text-ink-secondary sm:text-body-lg">
            Every serious aspirant needs more than a timetable. Our mentorship approach is designed
            to help students understand what to study, what to prioritise, where they are struggling
            and what to do next.
          </p>

          <ul className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, label, note }) => (
              <li key={label} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center bg-white text-indigo ring-1 ring-line">
                  <Icon aria-hidden className="size-5" strokeWidth={1.75} />
                </span>
                <span>
                  <span className="block text-body font-bold leading-snug text-indigo">{label}</span>
                  <span className="mt-0.5 block text-small text-ink-secondary">{note}</span>
                </span>
              </li>
            ))}
          </ul>

          <ButtonLink href={`${ROUTES.about}#philosophy`} variant="secondary" className="mt-9">
            Understand Our Mentorship
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}
