import { ArrowRight, Info } from "lucide-react";
import { notFound } from "next/navigation";

import Link from "@/i18n/Link";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { CTASection } from "@/components/ui/CTASection";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TrackedButtonLink } from "@/components/ui/TrackedLink";
import {
  GUIDES_REVIEWED_ON,
  UPSC_GUIDES,
  UPSC_OFFICIAL_SITE,
  getGuide,
  type GuideSection,
} from "@/data/upsc-guides";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { CTA, ROUTES } from "@/lib/constants/site";
import { pageMetadata } from "@/lib/seo/metadata";
import { faqSchema, jsonLd } from "@/lib/seo/structured-data";

export const dynamicParams = false;

export function generateStaticParams() {
  return UPSC_GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/upsc-guide/[slug]">) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  return pageMetadata({
    title: guide.title,
    description: guide.description,
    path: `${ROUTES.upscGuide}/${guide.slug}`,
    keywords: guide.keywords,
  });
}

function GuideBlock({ section }: { section: GuideSection }) {
  return (
    // scroll-mt clears the sticky header when jumping from "On this page".
    <section id={section.id} aria-labelledby={`${section.id}-heading`} className="scroll-mt-28">
      <h2 id={`${section.id}-heading`} className="text-h3 font-bold text-indigo">
        {section.heading}
      </h2>

      {section.paragraphs?.map((paragraph) => (
        <p key={paragraph.slice(0, 40)} className="mt-4 max-w-[68ch] text-body text-ink-secondary">
          {paragraph}
        </p>
      ))}

      {section.table ? (
        <Card padding="none" className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-small">
            <caption className="sr-only">{section.table.caption}</caption>
            <thead className="border-b-2 border-indigo bg-paper">
              <tr>
                {section.table.head.map((cell) => (
                  <th key={cell} scope="col" className="px-4 py-3 font-bold text-indigo">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {section.table.rows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, index) =>
                    index === 0 ? (
                      <th key={index} scope="row" className="px-4 py-3 align-top font-medium text-ink">
                        {cell}
                      </th>
                    ) : (
                      <td key={index} className="px-4 py-3 align-top text-ink-secondary">
                        {cell}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : null}

      {section.list ? (
        <ul className="mt-5 max-w-[68ch] space-y-2.5">
          {section.list.map((item) => (
            <li key={item} className="flex gap-3 text-body text-ink-secondary">
              <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 bg-kesar" />
              {item}
            </li>
          ))}
        </ul>
      ) : null}

      {section.note ? (
        <p className="mt-6 flex max-w-[68ch] gap-3 border-l-4 border-kesar bg-kesar-100/50 p-4 text-small text-ink">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-kesar-700" />
          {section.note}
        </p>
      ) : null}
    </section>
  );
}

export default async function GuidePage({ params }: PageProps<"/[lang]/upsc-guide/[slug]">) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const related = UPSC_GUIDES.filter((other) => other.slug !== guide.slug);
  // The counselling prompt sits after the second section: far enough in that
  // the reader has had an answer, early enough that most readers reach it.
  const [opening, rest] = [guide.sections.slice(0, 2), guide.sections.slice(2)];

  return (
    <>
      <PageHero
        eyebrow="UPSC guide"
        title={guide.title}
        description={guide.description}
        breadcrumbs={[
          { label: "Home", href: ROUTES.home },
          { label: "UPSC guide", href: ROUTES.upscGuide },
          { label: guide.shortTitle },
        ]}
      />

      <Section containerSize="wide">
        <div className="grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16">
          <nav aria-label="On this page" className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-eyebrow font-semibold uppercase text-ink-muted">On this page</p>
            <ol className="mt-3 space-y-2 border-l-2 border-line pl-4 text-small">
              {guide.sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="text-ink-secondary hover:text-indigo">
                    {section.heading}
                  </a>
                </li>
              ))}
              <li>
                <a href="#questions" className="text-ink-secondary hover:text-indigo">
                  Common questions
                </a>
              </li>
            </ol>
          </nav>

          <div className="space-y-12">
            {opening.map((section) => (
              <GuideBlock key={section.id} section={section} />
            ))}

            <Card tone="paper" padding="md" className="flex flex-wrap items-center justify-between gap-4">
              <div className="max-w-xl">
                <p className="text-h4 font-bold text-indigo">Not sure where this leaves you?</p>
                <p className="mt-1 text-small text-ink-secondary">
                  Take a free timed mock test to see your rank, or tell a counsellor your target
                  attempt and get a written plan in one call. Both free, no obligation.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <TrackedButtonLink
                  href={CTA.counselling.href}
                  event={ANALYTICS_EVENTS.counsellingClick}
                  payload={{ location: `guide-${guide.slug}-inline` }}
                >
                  {CTA.counselling.label}
                </TrackedButtonLink>
                <TrackedButtonLink
                  href={CTA.mockTest.href}
                  variant="secondary"
                  event={ANALYTICS_EVENTS.mockTestClick}
                  payload={{ location: `guide-${guide.slug}-inline` }}
                >
                  {CTA.mockTest.label}
                </TrackedButtonLink>
              </div>
            </Card>

            {rest.map((section) => (
              <GuideBlock key={section.id} section={section} />
            ))}

            <p className="border-t border-line pt-6 text-small text-ink-muted">
              Checked against the UPSC notification in {GUIDES_REVIEWED_ON}. UPSC can revise its
              rules each year — always confirm against the current notice on{" "}
              <a href={UPSC_OFFICIAL_SITE} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                upsc.gov.in
              </a>
              .
            </p>
          </div>
        </div>
      </Section>

      <Section id="questions" tone="paper" containerSize="default">
        <SectionHeader eyebrow="FAQ" title="Common questions" />
        <FAQAccordion faqs={guide.faqs} className="mt-10" />
      </Section>

      <Section containerSize="wide">
        <SectionHeader eyebrow="Keep reading" title="More UPSC guides" />
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {related.map((other) => (
            <li key={other.slug}>
              <Link
                href={`${ROUTES.upscGuide}/${other.slug}`}
                className="group flex h-full items-start justify-between gap-4 border border-line p-5 transition-colors hover:border-indigo"
              >
                <span className="text-body font-bold text-indigo">{other.shortTitle}</span>
                <ArrowRight aria-hidden className="mt-1 size-4 shrink-0 text-indigo transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <CTASection
        title="Know the exam. Now plan the attempt."
        description="A free counselling call ends with a written roadmap for your attempt — whether or not you join."
        location={`guide-${guide.slug}-final`}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema(guide.faqs)) }}
      />
    </>
  );
}
