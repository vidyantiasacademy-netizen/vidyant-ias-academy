import { ArrowRight } from "lucide-react";

import Link from "@/i18n/Link";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { CTASection } from "@/components/ui/CTASection";
import { GUIDES_REVIEWED_ON, UPSC_GUIDES, UPSC_OFFICIAL_SITE } from "@/data/upsc-guides";
import { ROUTES } from "@/lib/constants/site";
import { pageMetadata } from "@/lib/seo/metadata";

export const generateMetadata = () => pageMetadata({
  title: "UPSC Exam Guide — Eligibility, Pattern, Syllabus & How to Start",
  description:
    "Everything a first-time UPSC aspirant needs before choosing a coaching institute: eligibility and age limit, the exam pattern and marks, the full syllabus, and a beginner's preparation roadmap.",
  path: ROUTES.upscGuide,
  keywords: ["UPSC exam guide", "UPSC for beginners", "IAS exam details", "UPSC CSE"],
});

/** The four numbers every aspirant asks about first. */
const KEY_FACTS = [
  { value: "3", label: "stages — Prelims, Mains, Interview" },
  { value: "2,025", label: "marks decide your final rank" },
  { value: "21–32", label: "age limit for General category" },
  { value: "6", label: "attempts for General category" },
];

export default function UpscGuidePage() {
  return (
    <>
      <PageHero
        eyebrow="UPSC guide"
        title="The UPSC exam, explained plainly."
        description="Who can apply, how the exam works, what it tests and how to begin — before you spend a rupee on coaching."
        breadcrumbs={[{ label: "Home", href: ROUTES.home }, { label: "UPSC guide" }]}
      />

      <Section containerSize="wide">
        <dl className="grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-4">
          {KEY_FACTS.map((fact) => (
            <div key={fact.label} className="bg-white p-5 sm:p-6">
              <dt className="sr-only">{fact.label}</dt>
              <dd>
                <span className="block text-h2 font-bold tabular-nums text-indigo">{fact.value}</span>
                <span className="mt-1 block text-small text-ink-secondary">{fact.label}</span>
              </dd>
            </div>
          ))}
        </dl>

        <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:gap-5">
          {UPSC_GUIDES.map((guide, index) => (
            <li key={guide.slug}>
              <Card as="article" interactive className="relative flex h-full flex-col">
                <span className="text-eyebrow font-semibold uppercase text-kesar-600">
                  Guide {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-3 text-h4 font-bold text-indigo">
                  <Link
                    href={`${ROUTES.upscGuide}/${guide.slug}`}
                    className="after:absolute after:inset-0 focus-visible:outline-none"
                  >
                    {guide.title}
                  </Link>
                </h2>
                <p className="mt-3 flex-1 text-small text-ink-secondary">{guide.description}</p>
                <span aria-hidden className="mt-5 inline-flex items-center gap-2 text-small font-semibold text-indigo">
                  Read the guide
                  <ArrowRight className="size-4" />
                </span>
              </Card>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-small text-ink-muted">
          Checked against the UPSC notification in {GUIDES_REVIEWED_ON}. UPSC can change its rules
          each year — confirm the current notice on{" "}
          <a href={UPSC_OFFICIAL_SITE} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
            upsc.gov.in
          </a>
          .
        </p>
      </Section>

      <CTASection
        title="Know the exam? Now plan your attempt."
        description="Your graduation year, target attempt and optional decide where to start. A free counselling call turns this guide into a written roadmap for you — whether or not you join."
        location="upsc-guide-final"
      />
    </>
  );
}
