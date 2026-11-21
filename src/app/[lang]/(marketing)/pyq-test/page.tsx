import { BarChart3, BookOpenCheck, CalendarClock, Clock, ListChecks, MinusCircle, Target } from "lucide-react";
import { connection } from "next/server";

import { CallbackForm } from "@/components/forms/CallbackForm";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { MockRegistrationForm } from "@/components/mock-test/MockRegistrationForm";
import { Badge } from "@/components/ui/Badge";
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
  title: "Free UPSC PYQ Test — Sit Previous-Year Prelims Papers Online",
  description:
    "Sit actual UPSC Prelims previous-year papers online, timed, for free. Get your score, subject-wise analysis, weakest areas and the answer key with explanations.",
  path: ROUTES.pyqTest,
  keywords: [
    "UPSC PYQ test",
    "UPSC previous year question paper online test",
    "UPSC prelims PYQ",
    "free UPSC prelims test",
  ],
});

/** What the analysis after a PYQ paper shows. */
const WHAT_YOU_GET = [
  {
    icon: Target,
    title: "Your score, marked like the real paper",
    detail: "Correct, wrong and unattempted counted separately, with negative marking applied where the paper had it.",
  },
  {
    icon: BarChart3,
    title: "Subject-wise analysis",
    detail: "Polity, history, economy and the rest scored separately, with your weakest areas named.",
  },
  {
    icon: BookOpenCheck,
    title: "Answer key and explanations",
    detail: "Every question replayed with your answer, the right answer and why.",
  },
  {
    icon: CalendarClock,
    title: "Year by year",
    detail: "Sit the papers one year at a time to see how UPSC asks about the same topics over time.",
  },
];

const FAQS = [
  {
    id: "pyq-free",
    question: "Is the PYQ test free? Do I need an account?",
    answer:
      "It is free, and there is no account or login. Leave your name and mobile number, sign in with Google in one click, and the paper opens.",
  },
  {
    id: "pyq-real",
    question: "Are these the actual UPSC questions?",
    answer:
      "Yes. Each PYQ test reproduces the questions of the previous-year paper named on it, with the same number of questions, time and marking.",
  },
  {
    id: "pyq-calls",
    question: "Will someone call me?",
    answer:
      "A counsellor may call once to go through your analysis and answer questions. You are under no obligation to join, and you can ask us not to call again.",
  },
  {
    id: "pyq-retake",
    question: "Can I take the same paper twice?",
    answer:
      "One attempt per Google account per paper, so your analysis reflects a first, honest sitting. Other years are listed separately.",
  },
  {
    id: "pyq-device",
    question: "Can I take it on my phone?",
    answer:
      "Yes, though a laptop is closer to the real exam. Use one browser from start to finish: your sitting is tied to the browser you register on.",
  },
];

export default async function PyqTestPage() {
  // Papers open and close as the institute publishes them.
  await connection();
  const papers = await mockTestService.listOpenPapers("pyq");

  const year = new Date().getFullYear();
  const targetAttempts = [1, 2, 3].map((offset) => `CSE ${year + offset}`);

  return (
    <>
      <PageHero
        eyebrow="PYQ test"
        title="Sit the real UPSC papers. See exactly where you lose marks."
        description="Previous-year Prelims papers, timed and marked like the real exam. Register with your name and number, sign in with Google — no account to create — and get your score, subject-wise analysis and the answer key."
        breadcrumbs={[{ label: "Home", href: ROUTES.home }, { label: "PYQ test" }]}
      />

      <Section containerSize="wide">
        {papers.length === 0 ? (
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <SectionHeader
              layout="stack"
              eyebrow="Next paper"
              title="The first PYQ test opens soon."
              description="Leave your number and we will tell you when it opens — or talk to a counsellor about your preparation in the meantime."
            />
            <CallbackForm source="pyq-test-waitlist" defaultTopic="Programmes and syllabus" />
          </div>
        ) : (
          <ul className="space-y-8">
            {papers.map((paper) => (
              <li key={paper.id}>
                <Card padding="lg" className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      {paper.pyq ? <Badge>{paper.pyq.year}</Badge> : null}
                      {paper.pyq ? <Badge tone="neutral">{paper.pyq.exam}</Badge> : null}
                    </div>
                    <h2 className="mt-4 text-h2 font-bold text-indigo">{paper.title}</h2>
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

                  <MockRegistrationForm
                    testId={paper.id}
                    targetAttempts={targetAttempts}
                    series="pyq"
                  />
                </Card>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section tone="paper" containerSize="wide">
        <SectionHeader
          eyebrow="After you submit"
          title="Your performance analysis"
          description="A score alone is not information. Knowing which subjects cost you marks, and why each wrong answer was wrong, is."
        />
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
        title="Want someone to read your analysis with you?"
        description="Book a free counselling call and leave with a written plan for your weak areas — whether or not you join."
        location="pyq-test-final"
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema(FAQS)) }}
      />
    </>
  );
}
