import {
  ClipboardCheck,
  FileSearch,
  LineChart,
  Newspaper,
  Presentation,
  UserRoundCheck,
} from "lucide-react";

import { Section } from "@/components/layout/Section";
import { PlaceholderVisual } from "@/components/ui/PlaceholderVisual";
import { SectionHeader } from "@/components/ui/SectionHeader";

const REASONS = [
  {
    icon: Presentation,
    title: "Expert Teaching",
    description: "Concept-focused classes designed around the UPSC syllabus.",
  },
  {
    icon: UserRoundCheck,
    title: "Personal Mentorship",
    description: "Structured guidance throughout preparation.",
  },
  {
    icon: ClipboardCheck,
    title: "Test-Based Preparation",
    description: "Regular Prelims and Mains testing.",
  },
  {
    icon: FileSearch,
    title: "Answer Evaluation",
    description: "Detailed feedback on Mains answers.",
  },
  {
    icon: Newspaper,
    title: "Current Affairs",
    description: "News converted into UPSC-relevant learning.",
  },
  {
    icon: LineChart,
    title: "Performance Tracking",
    description: "Understand your strengths, weaknesses and progress.",
  },
];

/**
 * Asymmetric 5/7 split from lg: the argument and the classroom visual on the
 * left, the six reasons as a numbered 2×3 index on the right, each opened by
 * a hard indigo rule — one screen, not three.
 */
export function WhyVidyantIas() {
  return (
    <Section tone="paper" id="why-vidyantias">
      <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-x-12">
        <div className="lg:col-span-5">
          <SectionHeader
            eyebrow="Why vidyantIAS"
            title="UPSC preparation needs more than classes."
            description="Knowledge is only the starting point. Effective preparation requires practice, feedback, consistency and someone who can identify where you need to improve."
          />
          <PlaceholderVisual
            imageKey="classroom"
            tone="paper"
            className="mt-8 hidden aspect-[16/9] w-full lg:block"
          />
        </div>

        <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:col-span-7 lg:gap-y-10">
          {REASONS.map(({ icon: Icon, title, description }, index) => (
            <li key={title} className="border-t-2 border-indigo pt-4">
              <div className="flex items-center justify-between gap-4">
                <span aria-hidden className="text-small font-bold tabular-nums text-chilli-600">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Icon aria-hidden className="size-5 text-indigo" />
              </div>
              <h3 className="mt-3 text-h4 font-bold leading-snug text-indigo">{title}</h3>
              <p className="mt-1 text-body text-ink-secondary">{description}</p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
