import { CalendarCheck, Compass, PhoneCall, type LucideIcon } from "lucide-react";

import { SectionArt } from "@/components/ui/SectionArt";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ProgrammeCallbackForm } from "@/components/forms/ProgrammeCallbackForm";
import { Section } from "@/components/layout/Section";
import type { Course } from "@/types";

/** Same promise as the form's success message. */
const NEXT_STEPS: { icon: LucideIcon; text: string }[] = [
  { icon: PhoneCall, text: "We call you back in working hours" },
  { icon: Compass, text: "We ask where you are in your preparation" },
  { icon: CalendarCheck, text: "Nothing is charged or scheduled without you" },
];

/**
 * Tablet and up, directly under Programs: the callback form, placed where a
 * student has just compared programmes and is most likely to want a person.
 * Phones get `CallbackSection` further down instead.
 */
export function ProgrammeAdviceSection({ courses }: { courses: Course[] }) {
  return (
    <Section
      id="programme-advice"
      tone="white"
      containerSize="wide"
      className="max-md:hidden"
      art={<SectionArt variant="soft-left" />}
      aria-labelledby="programme-advice-heading"
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
        <div className="lg:col-span-6">
          <Eyebrow>Programme advice</Eyebrow>
          <h2
            id="programme-advice-heading"
            className="mt-4 max-w-[18ch] font-display text-h2 font-bold tracking-[-0.01em] text-indigo lg:text-h2-lg"
          >
            Not sure which programme is <em className="text-kesar-500">yours?</em>
          </h2>
          <p className="mt-4 max-w-[52ch] text-body-lg text-ink-secondary">
            Leave your number. A counsellor calls you, asks where you are in your
            preparation and suggests the programme that fits. Free.
          </p>
          <ol className="mt-8 grid max-w-xl gap-3">
            {NEXT_STEPS.map(({ icon: Icon, text }, i) => (
              <li
                key={text}
                className="flex items-center gap-4 rounded-[1rem] border border-line/70 bg-[linear-gradient(90deg,color-mix(in_oklab,var(--color-kesar-100)_45%,#fff)_0%,#fff_70%)] p-3 pr-5 shadow-soft"
              >
                <span
                  aria-hidden
                  className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-kesar-100 text-kesar-500"
                >
                  <Icon className="size-5.5" strokeWidth={1.75} />
                </span>
                <span className="text-body font-semibold text-indigo">
                  <span className="sr-only">Step {i + 1}: </span>
                  {text}
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="w-full max-w-md lg:col-span-5 lg:col-start-8 lg:justify-self-end">
          <ProgrammeCallbackForm courses={courses} />
        </div>
      </div>
    </Section>
  );
}
