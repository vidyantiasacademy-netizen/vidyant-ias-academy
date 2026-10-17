import Link from "@/i18n/Link";
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
    <Section id="programs" containerSize="wide">
      <SectionHeader
        eyebrow={`Programs · ${EXAM_CYCLE.label}`}
        title={
          <>
            Our{" "}
            <span className="-mx-1 box-decoration-clone bg-kesar-100 px-1">
              programs.
            </span>{" "}
            Pick your stage.
          </>
        }
        description="Each program is built around the same system — teaching, practice, testing, evaluation and mentorship — applied to the stage you are actually at."
        descriptionClassName="max-md:hidden"
        action={
          <ButtonLink href={CTA.courses.href} variant="secondary">
            View all courses
          </ButtonLink>
        }
      />

      <ProgramsCatalogue courses={courses} />

      {/* The way out for the undecided: a person, not another comparison. */}
      <p className="mt-6 text-small text-ink-secondary lg:mt-8">
        Not sure which one is you?{" "}
        <Link
          href={CTA.counselling.href}
          className="font-bold text-indigo underline decoration-kesar decoration-2 underline-offset-4 hover:decoration-indigo"
        >
          Get a free counselling call
        </Link>
      </p>
    </Section>
  );
}
