import { CourseComparison } from "@/components/courses/CourseComparison";
import { CourseFilters } from "@/components/courses/CourseFilters";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { CTASection } from "@/components/ui/CTASection";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getLocale } from "@/i18n/server";
import { ROUTES } from "@/lib/constants/site";
import { faqsByIds, getSiteFaqs } from "@/lib/content/site";
import { getCourseCatalogue } from "@/lib/courses/catalogue";
import { COURSE_CATEGORY_LABELS } from "@/lib/courses/labels";
import { pageMetadata, SEO_KEYWORDS } from "@/lib/seo/metadata";
import type { CourseCategory } from "@/types";

export const generateMetadata = () => pageMetadata({
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

export default async function CoursesPage() {
  const locale = await getLocale();
  const [courses, faqs] = await Promise.all([getCourseCatalogue(locale), getSiteFaqs(locale)]);

  return (
    <>
      <PageHero
        eyebrow="Programs"
        title="Choose your preparation path."
        description="Every program runs on the same system — teaching, practice, testing, evaluation and mentorship. What changes is the stage of preparation it is built for."
        breadcrumbs={[{ label: "Home", href: ROUTES.home }, { label: "Courses" }]}
      />

      <Section containerSize="wide">
        <CourseFilters courses={courses} filters={FILTERS} />
      </Section>

      {/* One programme has nothing to be compared with. */}
      {courses.length > 1 ? (
        <Section id="compare" tone="paper" containerSize="wide">
          <SectionHeader
            eyebrow="Compare"
            title="Every program, side by side"
            description="Duration, mode, testing, mentorship and fee in one view. Scroll sideways on a phone."
          />
          <div className="mt-10">
            <CourseComparison courses={courses} />
          </div>
        </Section>
      ) : null}

      {/* Keeps the white/paper alternation whether or not the table rendered. */}
      <Section tone={courses.length > 1 ? undefined : "paper"} containerSize="default">
        <SectionHeader
          eyebrow="Before you choose"
          title="Questions worth asking any institute"
          description="Including this one. If an answer here is unclear, ask the academic team directly."
        />
        <FAQAccordion faqs={faqsByIds(faqs, COURSE_FAQ_IDS)} className="mt-10" />
      </Section>

      <CTASection
        title="Not sure which program fits your attempt?"
        description="A counselling call takes twenty minutes and ends with a written roadmap — whether or not you enrol."
        location="courses-final"
      />
    </>
  );
}
