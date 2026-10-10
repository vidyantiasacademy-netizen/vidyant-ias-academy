import {
  Building2,
  ClipboardCheck,
  GraduationCap,
  Library,
  MonitorPlay,
  Route as RouteIcon,
} from "lucide-react";

import { FacultySection } from "@/components/home/FacultySection";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CTASection } from "@/components/ui/CTASection";
import { PlaceholderVisual } from "@/components/ui/PlaceholderVisual";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { BRAND, CONTACT, ROUTES } from "@/lib/constants/site";
import { pageMetadata, SEO_KEYWORDS } from "@/lib/seo/metadata";

export const generateMetadata = () => pageMetadata({
  title: "About Our UPSC Institute in Pune",
  description:
    "vidyantIAS is a UPSC preparation institute in Pune built around a single idea: learning, practice, evaluation and mentorship belong together. Read our philosophy, approach and how our programs are structured.",
  path: ROUTES.about,
  keywords: [...SEO_KEYWORDS.primary, "UPSC institute Pune philosophy"],
});

const PHILOSOPHY = [
  {
    stage: "Learning",
    detail:
      "Concept-first teaching against the syllabus, not against a textbook index. A topic is finished when you can use it, not when it has been covered.",
  },
  {
    stage: "Practice",
    detail:
      "Questions from the first week. Practice is what converts a lecture you understood into a mark you can score.",
  },
  {
    stage: "Evaluation",
    detail:
      "Tests and written answers returned with specific feedback: what the question demanded, what you wrote, and the gap between them.",
  },
  {
    stage: "Mentorship",
    detail:
      "One mentor who follows your preparation over months, reads your feedback trail and adjusts the plan with you.",
  },
  {
    stage: "Improvement",
    detail:
      "The cycle repeats with a sharper target each time. Progress is something we can point to, not something you have to feel.",
  },
];

const PROBLEMS = [
  {
    title: "Coverage without retention",
    detail:
      "The syllabus gets read, sometimes twice, but nothing tests whether it can be recalled under exam conditions.",
  },
  {
    title: "Reading instead of writing",
    detail:
      "Mains rewards structured writing. Most preparation postpones writing until it is too late to improve it.",
  },
  {
    title: "Feedback that says nothing",
    detail:
      "A score on a test is not feedback. Without knowing why marks were lost, the next attempt repeats the mistake.",
  },
  {
    title: "Plans made in isolation",
    detail:
      "An aspirant deciding alone what to prioritise is making the hardest call in preparation with the least information.",
  },
];

const INFRASTRUCTURE = [
  {
    icon: Building2,
    title: "Classrooms",
    detail: "Teaching rooms sized so that questions can actually be asked and answered.",
  },
  {
    icon: Library,
    title: "Reading space",
    detail: "A quiet study environment for aspirants who need somewhere to work consistently.",
  },
  {
    icon: MonitorPlay,
    title: "Hybrid delivery",
    detail: "Live online access and recordings where the program includes them.",
  },
  {
    icon: ClipboardCheck,
    title: "Test infrastructure",
    detail: "Centre-based and online testing with evaluation and discussion built in.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About vidyantIAS"
        title="A better way to prepare for UPSC."
        description={BRAND.description}
        breadcrumbs={[{ label: "Home", href: ROUTES.home }, { label: "About" }]}
      />

      <Section id="philosophy" containerSize="wide">
        <SectionHeader
          eyebrow="Our Philosophy"
          title="Learning → Practice → Evaluation → Mentorship → Improvement"
          description="These are not five services sold separately. They are one loop, and preparation breaks wherever the loop is cut."
        />

        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:mt-14 lg:grid-cols-5 lg:gap-x-6">
          {PHILOSOPHY.map((item, index) => (
            <li key={item.stage}>
              <div className="h-full border-t-2 border-indigo pt-5">
                <span className="text-h3 font-bold tabular-nums text-indigo">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-h4 font-bold">{item.stage}</h3>
                <p className="mt-2.5 text-small text-ink-secondary">{item.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="paper" containerSize="wide">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <SectionHeader
              eyebrow="Why We Exist"
              title="Unstructured preparation is the most common reason attempts are wasted."
              description="Aspirants rarely fail for lack of effort. They lose years to preparation that has no feedback loop — and by the time the pattern is visible, an attempt is gone."
            />
            <ButtonLink href={ROUTES.counselling} variant="primary" className="mt-8">
              Talk to an Academic Counsellor
            </ButtonLink>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {PROBLEMS.map((problem) => (
              <li key={problem.title}>
                <Card className="h-full">
                  <h3 className="text-h4 font-bold">{problem.title}</h3>
                  <p className="mt-2.5 text-small text-ink-secondary">{problem.detail}</p>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section containerSize="wide">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeader
              eyebrow="Our Approach"
              title="Preparation is personal. The system should be too."
              description="Two aspirants with the same syllabus need different sequences — one works full time, one has cleared Prelims twice, one is still choosing an optional."
            />
            <ul className="mt-8 space-y-4">
              <li className="flex gap-3">
                <RouteIcon aria-hidden className="mt-0.5 size-5 shrink-0 text-kesar-600" />
                <span className="text-body text-ink">
                  <span className="font-semibold text-indigo">A mapped starting point.</span>{" "}
                  Counselling establishes where you actually are before a program is
                  recommended.
                </span>
              </li>
              <li className="flex gap-3">
                <ClipboardCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-kesar-600" />
                <span className="text-body text-ink">
                  <span className="font-semibold text-indigo">A tested plan.</span> Weekly
                  targets tied to the test calendar, so the plan is checked against evidence.
                </span>
              </li>
              <li className="flex gap-3">
                <GraduationCap aria-hidden className="mt-0.5 size-5 shrink-0 text-kesar-600" />
                <span className="text-body text-ink">
                  <span className="font-semibold text-indigo">Faculty who evaluate.</span> The
                  people teaching a subject also read the answers written in it.
                </span>
              </li>
            </ul>
          </div>

          <PlaceholderVisual
            imageKey="classroom"
            tone="paper"
            label="Centre photography coming soon"
            className="aspect-4/3 w-full"
          />
        </div>
      </Section>

      <FacultySection />

      <Section id="infrastructure" containerSize="wide">
        <SectionHeader
          eyebrow="Infrastructure"
          title="A place built for long study days."
          description={`Our centre is in ${BRAND.city}. You are welcome to visit before enrolling — see the classrooms, meet the team and ask what you like.`}
          action={
            <ButtonLink href={ROUTES.contact} variant="secondary">
              Visit vidyantIAS
            </ButtonLink>
          }
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr] lg:grid-rows-2 lg:gap-5">
          <PlaceholderVisual
            imageKey="lectureHall"
            tone="paper"
            className="aspect-4/3 w-full sm:col-span-2 lg:col-span-1 lg:row-span-2 lg:aspect-auto"
          />
          <PlaceholderVisual imageKey="library" tone="paper" className="aspect-4/3 w-full lg:aspect-video" />
          <PlaceholderVisual imageKey="selfStudy" tone="paper" className="aspect-4/3 w-full lg:aspect-video" />
        </div>

        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:mt-5 lg:grid-cols-4 lg:gap-5">
          {INFRASTRUCTURE.map(({ icon: Icon, title, detail }) => (
            <li key={title}>
              <Card tone="paper" className="h-full">
                <span className="flex size-11 shrink-0 items-center justify-center border border-line bg-white text-kesar-600">
                  <Icon aria-hidden className="size-5" />
                </span>
                <h3 className="mt-5 text-h4 font-bold">{title}</h3>
                <p className="mt-2.5 text-small text-ink-secondary">{detail}</p>
              </Card>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-small text-ink-muted">
          Address and visiting hours:{" "}
          {CONTACT.addressLines.join(", ")}.
        </p>
      </Section>

      <CTASection
        title="Come and see how we teach."
        description="Attend a demo class, walk through the centre, and decide with evidence rather than a brochure."
        location="about-final"
      />
    </>
  );
}
