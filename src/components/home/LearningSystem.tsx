import {
  ArrowRight,
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
 * The six-stage cycle, in the same neubrutalist language as the hero's
 * programme picker but inverted for the indigo band: white cards, kesar hard
 * shadows, kesar connectors. The stages are not links, so the cards carry no
 * hover or press state — that would promise a click that goes nowhere.
 */
export function LearningSystem() {
  return (
    <Section tone="indigo" id="learning-system" containerSize="wide">
      <SectionHeader
        eyebrow="The vidyantIAS System"
        title={
          <>
            A preparation system built around{" "}
            <span className="-mx-1 box-decoration-clone rounded-sm bg-kesar px-1 text-indigo-900">
              improvement.
            </span>
          </>
        }
        description="Most aspirants do not fail for lack of information. They lose marks because nothing in their routine tells them what to fix. This cycle does."
        tone="light"
      />

      <ol className="mt-7 grid grid-cols-2 gap-4 sm:gap-5 lg:mt-9 lg:grid-cols-3 xl:grid-cols-6 xl:gap-6">
        {STAGES.map(({ label, description, icon: Icon }, index) => {
          const last = index === STAGES.length - 1;
          return (
            <li
              key={label}
              className="reveal relative"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <div className="relative flex h-full flex-col overflow-hidden rounded-xl border-2 border-white bg-white p-4 text-ink shadow-[5px_5px_0_0_var(--color-kesar)] sm:p-5">
                {/* Oversized step number — texture, not information. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -bottom-3 -right-1 select-none text-[4.5rem] font-black leading-none tracking-tighter text-indigo-100"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                {last ? (
                  <span className="absolute right-3 top-3 inline-flex -rotate-6 items-center gap-1 rounded-md border-2 border-indigo bg-kesar px-2 py-0.5 text-eyebrow font-bold uppercase text-indigo-900 shadow-[2px_2px_0_0_var(--color-indigo)]">
                    <RefreshCw aria-hidden className="size-3.5" />
                    Repeat
                  </span>
                ) : null}

                <span className="relative flex size-11 items-center justify-center rounded-lg bg-indigo-gradient text-white">
                  <Icon aria-hidden className="size-5.5" />
                </span>

                <h3 className="relative mt-4 text-h4 font-bold leading-tight text-indigo">
                  <span className="sr-only">Step {index + 1}: </span>
                  {label}
                </h3>
                <p className="relative mt-1.5 text-small font-medium text-ink-secondary">
                  {description}
                </p>
              </div>

              {/* Connector to the next stage, only where all six sit in a row. */}
              {!last ? (
                <span
                  aria-hidden
                  className="absolute -right-[1.15rem] top-1/2 z-10 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full border-2 border-indigo-900 bg-kesar text-indigo-900 xl:flex"
                >
                  <ArrowRight className="size-4" />
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>

      <p className="mt-7 max-w-2xl text-small text-white/75">
        The cycle repeats through the program. Each pass is meant to be measurably better
        than the last — that is the only honest definition of progress in UPSC preparation.
      </p>
    </Section>
  );
}
