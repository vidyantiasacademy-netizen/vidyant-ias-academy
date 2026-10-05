import { CourseCard } from "@/components/courses/CourseCard";
import { Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { homepageCourses } from "@/data/courses";
import { CTA } from "@/lib/constants/site";

const CTA_LABELS: Record<string, string> = {
  "foundation-program": "Explore Foundation",
  "prelims-program": "Explore Prelims",
  "mains-program": "Explore Mains",
  "optional-subjects": "Explore Optional",
};

export function ProgramsSection() {
  return (
    <Section id="programs" containerSize="wide">
      <SectionHeader
        eyebrow="Programs"
        title="Choose the preparation path that fits you."
        description="Each program is built around the same system — teaching, practice, testing, evaluation and mentorship — applied to the stage you are actually at."
        action={
          <ButtonLink href={CTA.courses.href} variant="secondary">
            {CTA.courses.label}
          </ButtonLink>
        }
      />

      <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:mt-14 lg:gap-5">
        {homepageCourses.map((course) => (
          <li key={course.id}>
            <CourseCard course={course} ctaLabel={CTA_LABELS[course.id]} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
