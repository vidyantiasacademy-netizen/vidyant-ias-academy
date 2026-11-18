import { ArrowRight, Headset } from "lucide-react";

import Link from "@/i18n/Link";
import { SectionArt } from "@/components/ui/SectionArt";
import { ProgramsCatalogue } from "@/components/home/ProgramsCatalogue";
import { Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CTA, EXAM_CYCLE } from "@/lib/constants/site";
import type { Course } from "@/types";

/**
 * The homepage's shop window: every listed programme as a poster card, with
 * stage tabs to narrow the shelf. Each card leads to the full course page or
 * straight to enrolment; fee, syllabus and faculty live on the course page.
 */
export function ProgramsSection({ courses }: { courses: Course[] }) {
  if (courses.length === 0) return null;

  return (
    <Section id="programs" tone="indigo" containerSize="wide" art={<SectionArt variant="programs" />}>
      <SectionHeader
        tone="light"
        eyebrow={`Programs · ${EXAM_CYCLE.label}`}
        title={
          <>
            Our{" "}
            <em>programs.</em>{" "}
            Pick your stage.
          </>
        }
        description="Each program is built around the same system — teaching, practice, testing, evaluation and mentorship — applied to the stage you are actually at."
        descriptionClassName="max-md:hidden"
        action={
          <ButtonLink href={CTA.courses.href} variant="outlineLight" className="rounded-full px-6">
            View all courses
            <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
        }
      />

      <ProgramsCatalogue courses={courses} onDark />

      {/* The way out for the undecided: a person, not another comparison. */}
      <p className="mt-8 flex w-fit items-center gap-3 rounded-full bg-white/[0.06] py-2 pr-5 pl-2 text-small text-white/85 ring-1 ring-white/12 lg:mt-10">
        <span aria-hidden className="flex size-9 items-center justify-center rounded-full bg-kesar text-indigo-900">
          <Headset className="size-4.5" />
        </span>
        <span>
        Not sure which one is you?{" "}
        <Link
          href={CTA.counselling.href}
          className="font-bold text-white underline decoration-kesar decoration-2 underline-offset-4 hover:text-kesar"
        >
          Get a free counselling call
        </Link>
        </span>
      </p>
    </Section>
  );
}
