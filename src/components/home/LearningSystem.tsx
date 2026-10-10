import {
  BookOpen,
  ClipboardCheck,
  Compass,
  PenLine,
  RefreshCw,
  SearchCheck,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

const STAGES: { label: string; description: string; icon: LucideIcon }[] = [
  { label: "Learn", description: "Build conceptual clarity.", icon: BookOpen },
  { label: "Practice", description: "Apply what you learn.", icon: PenLine },
  { label: "Test", description: "Measure your preparation.", icon: ClipboardCheck },
  { label: "Evaluate", description: "Understand mistakes.", icon: SearchCheck },
  { label: "Mentor", description: "Get personalised guidance.", icon: Compass },
  { label: "Improve", description: "Adjust and continue.", icon: TrendingUp },
];

/**
 * The six-stage cycle on the indigo band, Swiss: a numbered index of six
 * columns, each opened by a hard white rule. The stages are not links, so
 * they carry no hover or press state — that would promise a click that goes
 * nowhere.
 */
export function LearningSystem() {
  return (
    <Section tone="indigo" id="learning-system" containerSize="wide">
      <SectionHeader
        eyebrow="The vidyantIAS System"
        title={
          <>
            A preparation system built around{" "}
            <span className="-mx-1 box-decoration-clone bg-kesar px-1 text-indigo-900">
              improvement.
            </span>
          </>
        }
        description="Most aspirants do not fail for lack of information. They lose marks because nothing in their routine tells them what to fix. This cycle does."
        tone="light"
      />

      <ol className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 sm:gap-x-8 lg:mt-12 lg:grid-cols-3 xl:grid-cols-6">
        {STAGES.map(({ label, description, icon: Icon }, index) => {
          const last = index === STAGES.length - 1;
          return (
            <li
              key={label}
              className="reveal border-t-2 border-white pt-4"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <div className="flex items-center justify-between gap-3">
                <span aria-hidden className="text-small font-bold tabular-nums text-kesar">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {last ? (
                  <span className="inline-flex items-center gap-1 bg-kesar px-2 py-0.5 text-eyebrow font-bold uppercase text-indigo-900">
                    <RefreshCw aria-hidden className="size-3.5" />
                    Repeat
                  </span>
                ) : (
                  <Icon aria-hidden className="size-5 text-white" />
                )}
              </div>

              <h3 className="mt-4 text-h4 font-bold leading-tight text-white">
                <span className="sr-only">Step {index + 1}: </span>
                {label}
              </h3>
              <p className="mt-1.5 text-small text-white/80">{description}</p>
            </li>
          );
        })}
      </ol>

      <p className="mt-10 max-w-2xl text-small text-white/75">
        The cycle repeats through the program. Each pass is meant to be measurably better
        than the last — that is the only honest definition of progress in UPSC preparation.
      </p>
    </Section>
  );
}
