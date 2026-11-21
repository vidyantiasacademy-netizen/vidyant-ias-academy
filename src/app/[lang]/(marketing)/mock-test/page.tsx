import { BarChart3, BookOpenCheck, Clock, ListChecks, MinusCircle, Target, Trophy } from "lucide-react";
import { connection } from "next/server";

import { CallbackForm } from "@/components/forms/CallbackForm";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { MockRegistrationForm } from "@/components/mock-test/MockRegistrationForm";
import { Card } from "@/components/ui/Card";
import { CTASection } from "@/components/ui/CTASection";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ROUTES } from "@/lib/constants/site";
import { formatIst } from "@/lib/exam/ist";
import { pageMetadata } from "@/lib/seo/metadata";
import { faqSchema, jsonLd } from "@/lib/seo/structured-data";
import { mockTestService } from "@/services/mock-tests/mock-test.service";

export const generateMetadata = () => pageMetadata({
  title: "Free UPSC Prelims Mock Test — Get Your Rank",
  description:
    "Take a free, timed UPSC Prelims mock test online. Get your score, your rank, your weakest subjects and the answer key with explanations.",
  path: ROUTES.mockTest,
  keywords: [
    "free UPSC mock test",
    "UPSC prelims mock test online",
    "free IAS test series",
    "UPSC practice test with rank",
  ],
});

const WHAT_YOU_GET = [
  {
    icon: Trophy,
    title: "Your rank",
    detail: "Where your score places you among everyone who has taken the same paper.",
  },
  {
    icon: BarChart3,
    title: "Subject-wise scores",
    detail: "Polity, history, economy and the rest, scored separately — so you know which one is costing you.",
  },
  {
    icon: BookOpenCheck,
    title: "Answer key and explanations",
    detail: "Every question replayed with the right answer and why, once the key opens.",
  },
  {
    icon: Target,
    title: "A plan from your result",
    detail: "Optional: a counsellor walks you through your weak areas on a free call.",
  },
];

const FAQS = [
  {
    id: "mock-free",
    question: "Is the mock test really free?",
    answer:
      "Yes. There is no payment and no account to create — just your name, your mobile number and a one-click Google sign-in, so your result stays yours.",
  },
  {
    id: "mock-calls",
    question: "Will someone call me?",
    answer:
      "A counsellor may call once to go through your result and answer questions. You are under no obligation to join, and you can ask us not to call again.",
  },
  {
    id: "mock-retake",
    question: "Can I take the same paper twice?",
    answer:
      "No — one attempt per Google account per paper, so the rank list compares people, not retries. New papers are added regularly.",
  },
  {
    id: "mock-device",
    question: "Can I take it on my phone?",
    answer:
      "Yes, though a laptop is closer to the real exam. Use one browser from start to finish: your sitting is tied to the browser you register on.",
  },
  {
    id: "mock-pattern",
    question: "Is it like the real UPSC Prelims?",
    answer:
      "It follows the Prelims format: multiple-choice questions, a fixed time, and negative marking for wrong answers where the paper says so.",
  },
];

export default async function MockTestPage() {
  // The open papers change as the institute publishes and closes them.
  await connection();
  const papers = await mockTestService.listOpenPapers();

  const year = new Date().getFullYear();
  const targetAttempts = [1, 2, 3].map((offset) => `CSE ${year + offset}`);

  return (
    <>
      <PageHero
        eyebrow="Free mock test"
        title="Find out where you stand — free."
        description="A timed UPSC Prelims-pattern paper online. Finish it and see your score, your rank, your weakest subjects and the answer key. No payment, no account."
        breadcrumbs={[{ label: "Home", href: ROUTES.home }, { label: "Free mock test" }]}
      />

      <Section containerSize="wide">
        {papers.length === 0 ? (
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <SectionHeader
              layout="stack"
              eyebrow="Next paper"
              title="The next free mock test opens soon."
              description="Leave your number and we will tell you when it opens — or talk to a counsellor about your preparation in the meantime."
            />
            <CallbackForm source="mock-test-waitlist" defaultTopic="Programmes and syllabus" />
          </div>
        ) : (
          <ul className="space-y-8">
            {papers.map((paper) => (
              <li key={paper.id}>
                <Card padding="lg" className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
                  <div>
                    <p className="text-eyebrow font-semibold uppercase text-kesar-600">Open now</p>
                    <h2 className="mt-2 text-h2 font-bold text-indigo">{paper.title}</h2>
                    <ul className="mt-6 space-y-3 text-body text-ink">
                      <li className="flex items-center gap-3">
                        <ListChecks aria-hidden className="size-5 text-indigo" />
                        {paper.questionCount} questions · {paper.totalMarks} marks
                      </li>
                      <li className="flex items-center gap-3">
                        <Clock aria-hidden className="size-5 text-indigo" />
                        {paper.durationMinutes} minutes, timed
                      </li>
                      {paper.negativeMarksPerQuestion > 0 ? (
                        <li className="flex items-center gap-3">
                          <MinusCircle aria-hidden className="size-5 text-indigo" />
                          −{paper.negativeMarksPerQuestion} for each wrong answer
                        </li>
                      ) : null}
                    </ul>
                    {paper.closesAt ? (
                      <p className="mt-6 text-small font-medium text-chilli-700">
                        Closes {formatIst(paper.closesAt)}
                      </p>
                    ) : null}
                  </div>

                  <MockRegistrationForm testId={paper.id} targetAttempts={targetAttempts} />
                </Card>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section tone="paper" containerSize="wide">
        <SectionHeader eyebrow="After you submit" title="What you get" />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {WHAT_YOU_GET.map((item) => (
            <li key={item.title}>
              <Card className="h-full">
                <item.icon aria-hidden className="size-5 text-kesar-600" />
                <h3 className="mt-5 text-h4 font-bold">{item.title}</h3>
                <p className="mt-2.5 text-small text-ink-secondary">{item.detail}</p>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      <Section containerSize="default">
        <SectionHeader eyebrow="FAQ" title="Before you start" />
        <FAQAccordion faqs={FAQS} className="mt-10" />
      </Section>

      <CTASection
        title="Already know your weak areas?"
        description="Book a free counselling call and leave with a written plan for your attempt — whether or not you join."
        location="mock-test-final"
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema(FAQS)) }}
      />
    </>
  );
}
