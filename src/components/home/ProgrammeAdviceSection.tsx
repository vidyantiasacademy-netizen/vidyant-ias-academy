import { ProgrammeCallbackForm } from "@/components/forms/ProgrammeCallbackForm";
import { Section } from "@/components/layout/Section";
import type { Course } from "@/types";

/** Same promise as the form's success message. */
const NEXT_STEPS = [
  "We call you back in working hours",
  "We ask where you are in your preparation",
  "Nothing is charged or scheduled without you",
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
      tone="paper"
      containerSize="wide"
      className="max-md:hidden"
      aria-labelledby="programme-advice-heading"
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
        <div className="lg:col-span-6">
          <h2
            id="programme-advice-heading"
            className="max-w-[18ch] text-h2 font-bold text-indigo"
          >
            Not sure which programme is yours?
          </h2>
          <p className="mt-4 max-w-[52ch] text-body-lg text-ink-secondary">
            Leave your number. A counsellor calls you, asks where you are in your
            preparation and suggests the programme that fits. Free.
          </p>
          <ol className="mt-8 grid gap-4">
            {NEXT_STEPS.map((step, i) => (
              <li key={step} className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="flex size-8 shrink-0 items-center justify-center bg-indigo text-small font-bold tabular-nums text-white"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="pt-1 text-body text-ink-secondary">{step}</span>
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
