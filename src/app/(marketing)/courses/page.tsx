import { CourseFilters } from "@/components/courses/CourseFilters";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { CTASection } from "@/components/ui/CTASection";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { COURSE_CATEGORY_LABELS, publishedCourses } from "@/data/courses";
import { faqsByIds } from "@/data/faqs";
import { ROUTES } from "@/lib/constants/site";
import { pageMetadata, SEO_KEYWORDS } from "@/lib/seo/metadata";
import type { CourseCategory } from "@/types";

export const metadata = pageMetadata({
  title: "UPSC Courses in Pune — Foundation, Prelims, Mains & Optional",
  description:
    "Compare vidyantIAS UPSC programs in Pune: Foundation, Prelims, Mains, Optional subjects and the test series. Each program includes structured testing, answer evaluation and personal mentorship.",
  path: ROUTES.courses,
  keywords: [...SEO_KEYWORDS.secondary, ...SEO_KEYWORDS.primary],
});

const FILTERS: { id: CourseCategory | "all"; label: string }[] = [
  { id: "all", label: "All programs" },
  { id: "foundation", label: COURSE_CATEGORY_LABELS.foundation },
  { id: "prelims", label: COURSE_CATEGORY_LABELS.prelims },
  { id: "mains", label: COURSE_CATEGORY_LABELS.mains },
  { id: "optional", label: COURSE_CATEGORY_LABELS.optional },
  { id: "test-series", label: COURSE_CATEGORY_LABELS["test-series"] },
];

const COURSE_FAQ_IDS = ["faq-beginners", "faq-fees", "faq-online", "faq-recordings", "faq-material"];

export default function CoursesPage() {
  return (
    <>
      <PageHero
        eyebrow="Programs"
        title="Choose your preparation path."
        description="Every program runs on the same system — teaching, practice, testing, evaluation and mentorship. What changes is the stage of preparation it is built for."
        breadcrumbs={[{ label: "Home", href: ROUTES.home }, { label: "Courses" }]}
      />

      <Section containerSize="wide">
        <CourseFilters courses={publishedCourses} filters={FILTERS} />
      </Section>

      <Section tone="paper" containerSize="default">
        <SectionHeader
          eyebrow="Before you choose"
          title="Questions worth asking any institute"
          description="Including this one. If an answer here is unclear, ask the academic team directly."
        />
        <FAQAccordion faqs={faqsByIds(COURSE_FAQ_IDS)} className="mt-10" />
      </Section>

      <CTASection
        title="Not sure which program fits your attempt?"
        description="A counselling call takes twenty minutes and ends with a written roadmap — whether or not you enrol."
        location="courses-final"
      />
    </>
  );
}
