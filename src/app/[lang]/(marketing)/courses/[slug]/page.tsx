import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  IndianRupee,
  Laptop,
  Target,
  UserRoundCheck,
} from "lucide-react";
import { notFound } from "next/navigation";

import { BuyCourseButton } from "@/components/checkout/BuyCourseButton";
import { FacultyCard } from "@/components/faculty/FacultyCard";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CTASection } from "@/components/ui/CTASection";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TrackedButtonLink } from "@/components/ui/TrackedLink";
import { getLocale } from "@/i18n/server";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { CTA, ROUTES } from "@/lib/constants/site";
import { faqsByIds, getSiteFaqs } from "@/lib/content/site";
import { getCatalogueCourse, getCourseCatalogue } from "@/lib/courses/catalogue";
import { COURSE_CATEGORY_LABELS } from "@/lib/courses/labels";
import { getFacultyRoster } from "@/lib/faculty/roster";
import { pageMetadata } from "@/lib/seo/metadata";
import { courseSchema } from "@/lib/seo/structured-data";

export async function generateStaticParams() {
  const catalogue = await getCourseCatalogue();

  return catalogue.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/courses/[slug]">) {
  const { slug } = await params;
  const course = await getCatalogueCourse(slug, await getLocale());

  if (!course) {
    return pageMetadata({
      title: "Program not found",
      description: "This program is no longer listed.",
      path: `${ROUTES.courses}/${slug}`,
      noIndex: true,
    });
  }

  return pageMetadata({
    title: `${course.title} — UPSC Coaching in Pune`,
    description: course.shortDescription,
    path: `${ROUTES.courses}/${course.slug}`,
    keywords: [
      `${course.title} Pune`,
      `UPSC ${COURSE_CATEGORY_LABELS[course.category]} coaching Pune`,
    ],
  });
}

export default async function CourseDetailPage({ params }: PageProps<"/[lang]/courses/[slug]">) {
  const { slug } = await params;
  const locale = await getLocale();
  const course = await getCatalogueCourse(slug, locale);

  if (!course) notFound();

  const [roster, allFaqs] = await Promise.all([getFacultyRoster(locale), getSiteFaqs(locale)]);
  const teachers = course.faculty.flatMap(
    ({ slug: facultySlug }) => roster.find((member) => member.slug === facultySlug) ?? [],
  );
  const faqs = faqsByIds(allFaqs, course.faqIds);

  // Sanity fields are optional, so a block with nothing to say is left out
  // rather than rendered as a heading over an empty card.
  const support = [
    { icon: ClipboardCheck, title: "Tests", text: course.tests, items: [] as string[] },
    { icon: UserRoundCheck, title: "Mentorship", text: course.mentorship, items: [] as string[] },
    { icon: BookOpen, title: "Study material", text: "", items: course.studyMaterial },
  ].filter((block) => block.text || block.items.length > 0);

  const structure = [
    { icon: CalendarDays, label: "Duration", value: course.duration },
    { icon: Laptop, label: "Mode", value: course.mode.join(" • ") },
    { icon: ClipboardCheck, label: "Schedule", value: course.schedule },
    { icon: IndianRupee, label: "Fee", value: course.fee },
  ];

  return (
    <>
      <PageHero
        eyebrow={COURSE_CATEGORY_LABELS[course.category]}
        title={course.title}
        description={course.shortDescription}
        breadcrumbs={[
          { label: "Home", href: ROUTES.home },
          { label: "Courses", href: ROUTES.courses },
          { label: course.title },
        ]}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <BuyCourseButton course={course} location="course-hero" variant="kesar" size="lg">
            {course.priceInPaise ? `Enrol now · ${course.fee}` : "Enrol now"}
          </BuyCourseButton>
          <TrackedButtonLink
            href={CTA.counselling.href}
            variant="secondary"
            size="lg"
            event={ANALYTICS_EVENTS.courseCtaClick}
            payload={{ course: course.id, location: "course-hero" }}
          >
            {CTA.counselling.label}
          </TrackedButtonLink>
          <TrackedButtonLink
            href={CTA.demo.href}
            variant="secondary"
            size="lg"
            event={ANALYTICS_EVENTS.demoClick}
            payload={{ course: course.id, location: "course-hero" }}
          >
            {CTA.demo.label}
          </TrackedButtonLink>
        </div>
      </PageHero>

      <Section containerSize="wide">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <SectionHeader eyebrow="Overview" title="What this program does" />
            <p className="mt-6 text-body text-ink-secondary sm:text-body-lg">
              {course.description}
            </p>

            {course.audience.length > 0 ? (
              <>
                <h3 className="mt-10 text-h4 font-bold">Who is this for?</h3>
                <ul className="mt-4 space-y-3">
                  {course.audience.map((item) => (
                    <li key={item} className="flex gap-3 text-body text-ink">
                      <Target aria-hidden className="mt-1 size-4.5 shrink-0 text-kesar-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {course.outcomes.length > 0 ? (
              <>
                <h3 className="mt-10 text-h4 font-bold">What you&apos;ll learn</h3>
                <ul className="mt-4 space-y-3">
                  {course.outcomes.map((item) => (
                    <li key={item} className="flex gap-3 text-body text-ink">
                      <CheckCircle2 aria-hidden className="mt-1 size-4.5 shrink-0 text-kesar-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>

          <aside className="flex flex-col gap-4">
            <Card tone="paper">
              <h2 className="text-h4 font-bold">Course structure</h2>
              <dl className="mt-5 space-y-4">
                {structure.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1"
                  >
                    <Icon
                      aria-hidden
                      className="row-span-2 mt-0.5 size-4.5 shrink-0 text-kesar-600"
                    />
                    <dt className="text-eyebrow font-semibold uppercase text-ink-muted">
                      {label}
                    </dt>
                    <dd className="text-small text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </Card>

            {course.features.length > 0 ? (
              <Card>
                <h2 className="text-h4 font-bold">Included</h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {course.features.map((feature) => (
                    <li key={feature}>
                      <Badge tone="neutral">{feature}</Badge>
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}
          </aside>
        </div>
      </Section>

      {course.curriculum.length > 0 ? (
        <Section tone="paper" containerSize="wide">
          <SectionHeader
            eyebrow="Curriculum"
            title="What the program covers"
            description="Module order can shift with the batch calendar; coverage does not."
          />
          <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:gap-5">
            {course.curriculum.map((module) => (
              <li key={module.title}>
                <Card className="h-full">
                  <span className="flex size-10 shrink-0 items-center justify-center border border-line bg-white text-kesar-600">
                    <BookOpen aria-hidden className="size-5" />
                  </span>
                  <h3 className="mt-5 text-h4 font-bold">{module.title}</h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {module.topics.map((topic) => (
                      <li key={topic}>
                        <Badge tone="neutral">{topic}</Badge>
                      </li>
                    ))}
                  </ul>
                </Card>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {support.length > 0 ? (
        <Section containerSize="wide">
          <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
            {support.map(({ icon: Icon, title, text, items }) => (
              <Card key={title}>
                <Icon aria-hidden className="size-5 text-kesar-600" />
                <h2 className="mt-5 text-h4 font-bold">{title}</h2>
                {text ? <p className="mt-3 text-small text-ink-secondary">{text}</p> : null}
                {items.length > 0 ? (
                  <ul className="mt-3 space-y-2 text-small text-ink-secondary">
                    {items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </Card>
            ))}
          </div>
        </Section>
      ) : null}

      {teachers.length > 0 ? (
        <Section tone="paper" containerSize="wide">
          <SectionHeader
            eyebrow="Faculty"
            title="Who teaches this program"
            description="Subject faculty teach the classes and evaluate the answers written in their subject."
          />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {teachers.map((member) => (
              <li key={member.id}>
                <FacultyCard member={member} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {faqs.length > 0 ? (
        <Section containerSize="default">
          <SectionHeader eyebrow="FAQ" title={`${course.title} — common questions`} />
          <FAQAccordion faqs={faqs} className="mt-10" />
        </Section>
      ) : null}

      <CTASection
        title={`Is ${course.title} the right fit for your attempt?`}
        description="Speak with the academic team before you decide. If another program suits you better, we will say so."
        location={`course-${course.id}-final`}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema(course)) }}
      />
    </>
  );
}
