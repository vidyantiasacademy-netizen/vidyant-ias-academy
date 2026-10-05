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
  { icon: UserRoundCheck, label: "Personal mentor", note: "One person who knows your preparation." },
  { icon: Target, label: "Goal setting", note: "Weekly targets you can actually finish." },
  { icon: TrendingUp, label: "Progress reviews", note: "Periodic reviews against your plan." },
  { icon: ClipboardList, label: "Test analysis", note: "Why marks were lost, not just how many." },
  { icon: CalendarClock, label: "Study planning", note: "A sequence that fits your hours." },
  { icon: MessageSquareQuote, label: "Doubt resolution", note: "Answers before doubts pile up." },
];

export function MentorshipSection() {
  return (
    <Section tone="paper" id="mentorship" containerSize="wide">
      <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <PlaceholderVisual
          imageKey="mentorshipSession"
          tone="paper"
          label="Mentor and student in a test review — photography coming soon"
          className="aspect-4/3 w-full lg:aspect-4/5"
        />

        <div>
          <Eyebrow>Mentorship</Eyebrow>
          <h2 className="mt-4 text-h2 font-semibold lg:text-h2-lg">
            You shouldn&apos;t have to prepare alone.
          </h2>
          <p className="mt-5 text-body text-ink-secondary sm:text-body-lg">
            Every serious aspirant needs more than a timetable. Our mentorship approach is
            designed to help students understand what to study, what to prioritise, where
            they are struggling and what to do next.
          </p>

          <ul className="mt-9 grid gap-x-6 gap-y-5 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, label, note }) => (
              <li key={label} className="flex gap-3">
                <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-kesar-600" />
                <span>
                  <span className="block text-body font-semibold text-indigo">{label}</span>
                  <span className="text-small text-ink-secondary">{note}</span>
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
