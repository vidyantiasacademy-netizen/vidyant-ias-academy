import { ListChecks } from "lucide-react";

import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { QuizCard } from "@/components/quizzes/QuizCard";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CTASection } from "@/components/ui/CTASection";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { QUIZ_PLAN, latestQuizzes } from "@/data/quizzes";
import { CTA, ROUTES } from "@/lib/constants/site";
import { pageMetadata } from "@/lib/seo/metadata";

export const generateMetadata = () => pageMetadata({
  title: "Free UPSC Practice Quizzes — Prelims, CSAT & Current Affairs",
  description:
    "Short, free UPSC practice quizzes from vidyantIAS Pune: weekly Prelims sets, a current affairs quiz and fortnightly CSAT practice, each with explanations for every option.",
  path: ROUTES.quizzes,
  keywords: [
    "UPSC quiz",
    "UPSC prelims practice questions",
    "CSAT practice",
    "current affairs quiz",
  ],
});

/** How a quiz is built — the part that decides whether practice is useful. */
const METHOD = [
  {
    title: "Ten questions, one area",
    note: "A quiz covers one syllabus area at a time, so a weak score points at something you can actually revise.",
  },
  {
    title: "Every option explained",
    note: "Not just the right answer — why each wrong option is wrong, which is where most Prelims marks are lost.",
  },
  {
    title: "Paper-level difficulty",
    note: "Questions are set at the standard of the real paper, not made easy to flatter a score.",
  },
];

export default function QuizzesPage() {
  const quizzes = latestQuizzes();

  return (
    <>
      <PageHero
        eyebrow="Practice Quizzes"
        title="Practise in short sets. Free, and open to everyone."
        description="You do not need to be enrolled to use these. Ten questions take twelve minutes, and every option carries an explanation."
        breadcrumbs={[{ label: "Home", href: ROUTES.home }, { label: "Quizzes" }]}
      />

      <Section containerSize="wide">
        {quizzes.length > 0 ? (
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {quizzes.map((quiz) => (
              <li key={quiz.id}>
                <QuizCard quiz={quiz} />
              </li>
            ))}
          </ul>
        ) : (
          <>
            <EmptyState
              icon={<ListChecks aria-hidden className="size-5" />}
              title="The quiz calendar starts with the first batch."
              description="Rather than fill this page with questions copied from somewhere else, here is the cadence we are committing to. Leave a number and we will tell you when the first set opens."
              action={
                <ButtonLink href={CTA.callback.href} variant="kesar" size="lg">
                  {CTA.callback.label}
                </ButtonLink>
              }
            />

            <ul className="mt-6 grid gap-4 md:grid-cols-3 lg:gap-5">
              {QUIZ_PLAN.map((item) => (
                <li key={item.stage}>
                  <Card className="h-full">
                    <h2 className="text-h4 font-bold text-indigo">{item.title}</h2>
                    <p className="mt-3 text-small text-ink-secondary">{item.note}</p>
                  </Card>
                </li>
              ))}
            </ul>
          </>
        )}
      </Section>

      <Section tone="paper" containerSize="wide">
        <SectionHeader
          eyebrow="How the quizzes work"
          title="A quiz is only useful if it tells you what to fix."
          description="Scoring 6 out of 10 is not information. Knowing which six, and why the other four went wrong, is."
        />
        <ul className="mt-12 grid gap-4 md:grid-cols-3 lg:gap-5">
          {METHOD.map((item) => (
            <li key={item.title}>
              <Card className="h-full bg-white">
                <h3 className="text-h4 font-bold text-indigo">{item.title}</h3>
                <p className="mt-3 text-small text-ink-secondary">{item.note}</p>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      <CTASection
        title="Practice is better with someone reading your answers."
        description="Our test series adds evaluated Mains answers and a mentor who reviews each attempt with you."
        location="quizzes-final"
      />
    </>
  );
}
