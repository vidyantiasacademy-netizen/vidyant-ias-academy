import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

const STAGES = [
  { label: "Learn", description: "Build conceptual clarity." },
  { label: "Practice", description: "Apply what you learn." },
  { label: "Test", description: "Measure your preparation." },
  { label: "Evaluate", description: "Understand mistakes." },
  { label: "Mentor", description: "Get personalised guidance." },
  { label: "Improve", description: "Adjust and continue." },
];

export function LearningSystem() {
  return (
    <Section tone="indigo" id="learning-system" containerSize="wide">
      <SectionHeader
        eyebrow="The vidyantIAS System"
        title="A preparation system built around improvement."
        description="Most aspirants do not fail for lack of information. They lose marks because nothing in their routine tells them what to fix. This cycle does."
        tone="light"
      />

      <ol className="mt-12 grid gap-px overflow-hidden rounded-lg border border-white/15 bg-white/15 sm:grid-cols-2 lg:mt-16 lg:grid-cols-6">
        {STAGES.map((stage, index) => (
          <li key={stage.label} className="relative bg-indigo p-6 lg:p-7">
            <span className="text-small font-semibold text-kesar">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-3 text-h4 font-semibold text-white">{stage.label}</h3>
            <p className="mt-2 text-small text-white/75">{stage.description}</p>
            {index < STAGES.length - 1 ? (
              <span
                aria-hidden
                className="absolute right-0 top-1/2 hidden h-2 w-2 -translate-y-1/2 translate-x-1 rotate-45 border-r border-t border-kesar lg:block"
              />
            ) : null}
          </li>
        ))}
      </ol>

      <p className="mt-8 max-w-2xl text-small text-white/70">
        The cycle repeats through the program. Each pass is meant to be measurably better
        than the last — that is the only honest definition of progress in UPSC preparation.
      </p>
    </Section>
  );
}
