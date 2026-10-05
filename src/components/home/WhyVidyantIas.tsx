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

export function WhyVidyantIas() {
  return (
    <Section tone="paper" id="why-vidyantias">
      <SectionHeader
        eyebrow="Why vidyantIAS"
        title="UPSC preparation needs more than classes."
        description="Knowledge is only the starting point. Effective preparation requires practice, feedback, consistency and someone who can identify where you need to improve."
      />

      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-5">
        {REASONS.map(({ icon: Icon, title, description }) => (
          <li key={title}>
            <Card className="h-full">
              <span className="flex size-11 items-center justify-center rounded-md bg-white text-kesar-600 ring-1 ring-line">
                <Icon aria-hidden className="size-5" />
              </span>
              <h3 className="mt-5 text-h4 font-semibold">{title}</h3>
              <p className="mt-2.5 text-body text-ink-secondary">{description}</p>
            </Card>
          </li>
        ))}
      </ul>
    </Section>
  );
}
