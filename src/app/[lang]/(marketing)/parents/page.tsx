import { ArrowRight, CalendarClock, HeartHandshake, Wallet } from "lucide-react";

import Link from "@/i18n/Link";
import { CallbackForm } from "@/components/forms/CallbackForm";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { CTASection } from "@/components/ui/CTASection";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { BRAND, CTA, ROUTES } from "@/lib/constants/site";
import { pageMetadata } from "@/lib/seo/metadata";
import { faqSchema, jsonLd } from "@/lib/seo/structured-data";

export const generateMetadata = () => pageMetadata({
  title: "For Parents — Supporting Your Child's UPSC Preparation",
  description:
    "A plain guide for parents of UPSC aspirants: how long preparation really takes, what to budget for, how to support without adding pressure, and the questions to ask any coaching institute in Pune.",
  path: ROUTES.parents,
  keywords: [
    "UPSC coaching for my child",
    "UPSC preparation parents guide",
    "IAS coaching Pune for son daughter",
  ],
});

/**
 * Parents are often the ones who pay and, in many families, the ones who
 * decide. They ask different questions from aspirants — time, cost, safety,
 * "what if it doesn't work out" — and this page answers those directly.
 *
 * Every claim about vidyantIAS here links to the page that backs it. Nothing
 * is promised that the rest of the site does not already state.
 */

const REALITY = [
  {
    icon: CalendarClock,
    title: "It takes longer than one year",
    detail:
      "A full exam cycle runs about a year from notification to final result, and most successful candidates clear it in their second or third attempt. Plan for two to three years, and be pleasantly surprised if it takes less.",
  },
  {
    icon: Wallet,
    title: "Coaching is only part of the cost",
    detail:
      "Budget for books, test series, a newspaper subscription and — if your child moves cities — rent and food for the whole period, not only the course fee. Ask any institute for its full fee, instalment options and refund policy in writing.",
  },
  {
    icon: HeartHandshake,
    title: "The hardest part is not academic",
    detail:
      "Long hours alone, uncertain results and peers who have started earning take a toll. Steady support at home often matters as much as any book or class.",
  },
];

const SUPPORT = [
  "Ask about the plan, not the marks. \"What are you revising this week?\" helps more than \"How did the test go?\"",
  "Agree in advance how many attempts the family can support, and what the plan is after that. Uncertainty is worse than a clear limit.",
  "Protect a routine — regular sleep, a fixed study space, some exercise. Burnout ends more attempts than difficulty does.",
  "Keep comparisons out of the house — with cousins, neighbours' children or toppers in the news.",
  "Treat a failed Prelims as information, not a verdict. Most selected candidates have failed at least once.",
];

/** Questions to put to any institute — each answered with the page that shows ours. */
const QUESTIONS = [
  {
    question: "Can my child attend a class before we pay?",
    answer: "Yes. Demo classes are free and carry no obligation to enrol.",
    href: CTA.demo.href,
    linkLabel: "Book a free demo",
  },
  {
    question: "Who will personally guide my child?",
    answer: "Each student has one mentor who tracks their progress from the first day and adjusts the plan with them.",
    href: ROUTES.about,
    linkLabel: "How mentorship works",
  },
  {
    question: "How will we know if preparation is on track?",
    answer:
      "Tests run on a fixed calendar, and scores and subject-wise performance are tracked in the student dashboard.",
    href: ROUTES.courses,
    linkLabel: "See the programs",
  },
  {
    question: "Are the results you advertise real?",
    answer:
      "We publish only verified results — named candidates, the stage they cleared and the year, with their consent. We are a new institute and say so.",
    href: ROUTES.results,
    linkLabel: "Our results policy",
  },
  {
    question: "What happens to the fee if it doesn't work out?",
    answer: "Our refund policy is published in full, before you pay anything.",
    href: ROUTES.refund,
    linkLabel: "Read the refund policy",
  },
];

const FAQS = [
  {
    id: "parents-age",
    question: "Is my child the right age to start preparing for UPSC?",
    answer:
      "Candidates must be at least 21 on 1 August of the exam year, and can apply for Prelims in their final year of graduation. Preparation can start earlier — many begin with two hours a day during college.",
  },
  {
    id: "parents-college",
    question: "Should my child prepare during college or after graduation?",
    answer:
      "Starting the foundation during college — NCERTs, a daily newspaper, some answer writing — can save most of a year later. Full-time preparation usually begins after the degree.",
  },
  {
    id: "parents-plan-b",
    question: "What if my child does not clear UPSC?",
    answer:
      "The preparation is not wasted. The same syllabus covers state public service commissions and many other government examinations, and the writing, analysis and current-affairs knowledge carry into almost any career. Agreeing on a time limit and a plan B early makes the attempt calmer, not weaker.",
  },
  {
    id: "parents-join-call",
    question: "Can I speak to the institute myself?",
    answer:
      "Yes. Request a callback on this page and choose \"A parent's questions\", or join your child's counselling call.",
  },
];

export default function ParentsPage() {
  return (
    <>
      <PageHero
        eyebrow="For parents"
        title="What your child's UPSC preparation will really involve."
        description="An honest picture of the time, the cost and the pressure — and the questions to ask any institute, including us, before you pay."
        breadcrumbs={[{ label: "Home", href: ROUTES.home }, { label: "For parents" }]}
      />

      <Section containerSize="wide">
        <SectionHeader
          eyebrow="The honest picture"
          title="Three things families wish they had known earlier"
        />
        <ul className="mt-10 grid gap-4 md:grid-cols-3 lg:gap-5">
          {REALITY.map((item) => (
            <li key={item.title}>
              <Card className="h-full">
                <item.icon aria-hidden className="size-5 text-kesar-600" />
                <h3 className="mt-5 text-h4 font-bold">{item.title}</h3>
                <p className="mt-2.5 text-small text-ink-secondary">{item.detail}</p>
              </Card>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-small text-ink-secondary">
          New to the exam itself?{" "}
          <Link href={ROUTES.upscGuide} className="font-medium text-indigo underline decoration-kesar decoration-2 underline-offset-4">
            Read our plain guide to UPSC eligibility, pattern and syllabus
          </Link>
          .
        </p>
      </Section>

      <Section tone="paper" containerSize="wide">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <SectionHeader
            layout="stack"
            eyebrow="At home"
            title="How to help without adding pressure"
            description="Small things, repeated over two years, decide how an aspirant holds up."
          />
          <ol className="space-y-5">
            {SUPPORT.map((item, index) => (
              <li key={item} className="flex gap-4 border-t-2 border-indigo pt-4">
                <span className="text-h4 font-bold tabular-nums text-indigo">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-body text-ink-secondary">{item}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section containerSize="wide">
        <SectionHeader
          eyebrow="Choosing an institute"
          title="Five questions to ask any coaching institute"
          description={`Put these to every institute you visit. Here is how ${BRAND.name} answers them — each with the page that shows it.`}
        />
        <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:gap-5">
          {QUESTIONS.map((item, index) => (
            <li key={item.question}>
              <Card className="flex h-full flex-col">
                <span className="text-eyebrow font-semibold uppercase text-kesar-600">
                  Question {index + 1}
                </span>
                <h3 className="mt-3 text-h4 font-bold">{item.question}</h3>
                <p className="mt-2.5 flex-1 text-small text-ink-secondary">{item.answer}</p>
                <Link
                  href={item.href}
                  className="mt-5 inline-flex items-center gap-2 text-small font-semibold text-indigo underline-offset-4 hover:underline"
                >
                  {item.linkLabel}
                  <ArrowRight aria-hidden className="size-4" />
                </Link>
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="paper" containerSize="wide">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <SectionHeader layout="stack" eyebrow="FAQ" title="Questions parents ask us" />
            <FAQAccordion faqs={FAQS} className="mt-10" />
          </div>
          <CallbackForm source="parents-page" defaultTopic="A parent's questions" />
        </div>
      </Section>

      <CTASection
        title="Bring your questions to a counselling call."
        description="Join your child's free counselling call. You will leave knowing the plan, the fee and the timeline — whether or not they join."
        location="parents-final"
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema(FAQS)) }}
      />
    </>
  );
}
