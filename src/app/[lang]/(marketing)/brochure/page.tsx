import { BrochureForm } from "@/components/forms/BrochureForm";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CTASection } from "@/components/ui/CTASection";
import { getLocale } from "@/i18n/server";
import { BROCHURE, CTA, EXAM_CYCLE, ROUTES } from "@/lib/constants/site";
import { getCourseCatalogue } from "@/lib/courses/catalogue";
import { pageMetadata, SEO_KEYWORDS } from "@/lib/seo/metadata";

export const generateMetadata = () => pageMetadata({
  title: `Download the ${EXAM_CYCLE.label} Brochure`,
  description:
    "Download the vidyantIAS brochure: programmes, batch structure, the test and evaluation calendar, mentorship model and fee structure for UPSC CSE 2026.",
  path: ROUTES.brochure,
  keywords: [...SEO_KEYWORDS.primary, "vidyantIAS brochure", "UPSC course details Pune"],
});

const CONTENTS = [
  "Every programme, with what each one includes",
  "Batch structure, timings and modes of attendance",
  "The test calendar and how answers are evaluated",
  "How mentorship and performance tracking work",
  "Fee structure, instalment options and refund policy",
];

export default async function BrochurePage() {
  const courses = await getCourseCatalogue(await getLocale());

  return (
    <>
      <PageHero
        eyebrow="Brochure"
        title="Everything about our programmes, in one PDF."
        description={BROCHURE.note}
        breadcrumbs={[{ label: "Home", href: ROUTES.home }, { label: "Brochure" }]}
      />

      <Section containerSize="wide">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <BrochureForm courses={courses} />

          <aside className="flex flex-col gap-4">
            <Card tone="paper">
              <h2 className="text-h4 font-bold">What is inside</h2>
              <ul className="mt-5 space-y-3">
                {CONTENTS.map((item) => (
                  <li key={item} className="flex gap-3 text-body text-ink-secondary">
                    <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-kesar" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <h2 className="text-h4 font-bold">Free either way</h2>
              <p className="mt-3 text-body text-ink-secondary">
                Our syllabus, booklist and starter kit are available without the brochure —
                nothing important is kept behind this form.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <ButtonLink href={ROUTES.resources} variant="secondary">
                  {CTA.resources.label}
                </ButtonLink>
                <ButtonLink href={CTA.courses.href} variant="secondary">
                  {CTA.courses.label}
                </ButtonLink>
              </div>
            </Card>
          </aside>
        </div>
      </Section>

      <CTASection
        title="Would a conversation be faster?"
        description="Our academic team can answer in ten minutes what takes a brochure twenty pages. Book a free counselling session."
        location="brochure-final"
      />
    </>
  );
}
