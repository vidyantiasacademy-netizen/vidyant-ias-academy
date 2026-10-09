import {
  ClipboardCheck,
  FileSearch,
  LineChart,
  Newspaper,
  Presentation,
  UserRoundCheck,
} from "lucide-react";

import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
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
 * Two columns from lg: the argument and the classroom visual on the left, the
 * six reasons as a compact 2×3 grid on the right — one screen, not three.
 */
export function WhyVidyantIas() {
  return (
    <Section tone="paper" id="why-vidyantias">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-12">
        <div>
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

        <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {REASONS.map(({ icon: Icon, title, description }) => (
            <li key={title}>
              <Card padding="sm" className="flex h-full gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-white text-kesar-600 ring-1 ring-line">
                  <Icon aria-hidden className="size-5" />
                </span>
                <div>
                  <h3 className="text-h4 font-semibold leading-snug">{title}</h3>
                  <p className="mt-1 text-body text-ink-secondary">{description}</p>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
