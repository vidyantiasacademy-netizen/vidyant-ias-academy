import { Building2, ClipboardCheck, Library, MonitorPlay } from "lucide-react";

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

export const generateMetadata = () =>
  pageMetadata({
    title: "About Our UPSC Institute in Pune",
    description:
      "Vidyant IAS, Pune: experienced teaching, structured programmes, regular practice and personalised guidance for UPSC Civil Services preparation. Our philosophy, approach and commitment.",
    path: ROUTES.about,
    keywords: [...SEO_KEYWORDS.primary, "UPSC institute Pune philosophy"],
  });

/** The five principles behind "Right Knowledge. Right Direction. Every Step." */
const PRINCIPLES = [
  {
    stage: "Learning",
    title: "Understanding comes first",
    detail:
      "We build conceptual foundations, connect subjects with current developments and encourage students to question and reason independently.",
  },
  {
    stage: "Practice",
    title: "Knowledge must translate into performance",
    detail:
      "Regular tests, revision and answer-writing exercises develop accuracy in Prelims and clarity in Mains.",
  },
  {
    stage: "Evaluation",
    title: "Every assessment should lead to insight",
    detail:
      "We examine mistakes and performance patterns, not just scores, to identify practical areas for improvement.",
  },
  {
    stage: "Mentorship",
    title: "Guidance should recognise the individual",
    detail:
      "We help aspirants set priorities suited to their preparation stage, strengths and constraints.",
  },
  {
    stage: "Improvement",
    title: "Feedback must become action",
    detail:
      "Focused revision and timely changes turn assessment into measurable progress.",
  },
];

/** The four essentials our work addresses. */
const ESSENTIALS = [
  {
    title: "Understanding beyond coverage",
    detail: "Conceptual clarity, not just a syllabus that has been read.",
  },
  {
    title: "Applying knowledge in the exam",
    detail: "Using what you know under real examination conditions.",
  },
  {
    title: "Assessment that corrects",
    detail: "Using every test to find and fix mistakes.",
  },
  {
    title: "Clear, realistic priorities",
    detail: "Knowing what to study next — and what can wait.",
  },
];

const APPROACH = [
  {
    title: "Understand the starting point",
    detail:
      "Identify each student's preparation stage, strengths and immediate priorities.",
  },
  {
    title: "Build concepts systematically",
    detail:
      "Teach core subjects in a syllabus-aligned sequence, with relevant current affairs connections.",
  },
  {
    title: "Practise throughout preparation",
    detail:
      "Integrate tests, revision and answer writing into regular learning rather than leaving them until the end.",
  },
  {
    title: "Use evaluation to improve",
    detail:
      "Provide subject-wise feedback that identifies recurring errors and guides the next steps.",
  },
  {
    title: "Guide beyond the classroom",
    detail:
      "Support decisions on resources, time management, revision and examination strategy while encouraging independent study.",
  },
];

const INFRASTRUCTURE = [
  {
    icon: Building2,
    title: "Classrooms",
    detail:
      "Teaching rooms sized so that questions can actually be asked and answered.",
  },
  {
    icon: Library,
    title: "Reading space",
    detail:
      "A quiet study environment for aspirants who need somewhere to work consistently.",
  },
  {
    icon: MonitorPlay,
    title: "Hybrid delivery",
    detail:
      "Live online access and recordings where the program includes them.",
  },
  {
    icon: ClipboardCheck,
    title: "Test infrastructure",
    detail:
      "Centre-based and online testing with evaluation and discussion built in.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Vidyant IAS"
        title="A stronger foundation. A more purposeful preparation."
        description="At Vidyant IAS, we believe effective Civil Services preparation begins with understanding. Based in Pune, we combine experienced teaching, structured programmes, regular practice and personalised guidance to help aspirants prepare with clarity and confidence."
        breadcrumbs={[{ label: "Home", href: ROUTES.home }, { label: "About" }]}
      />

      <Section containerSize="default">
        <p className="text-h4 font-semibold text-indigo text-balance">
          Our focus extends beyond syllabus completion. We help students connect
          ideas, think critically and apply their knowledge in Prelims and
          Mains.
        </p>
      </Section>

      <Section id="philosophy" tone="paper" containerSize="wide">
        <SectionHeader
          eyebrow="Our Philosophy"
          title="Right Knowledge. Right Direction. Every Step."
          description="In an age of information overload, we focus on providing aspirants with the right knowledge, grounded in conceptual clarity and examination relevance. Through structured learning, regular practice, meaningful evaluation and personalised mentorship, we give their preparation the right direction and guide them at every stage of their UPSC journey."
        />

        <p className="mt-10 text-eyebrow font-semibold uppercase text-kesar-600">
          Five core principles shape this philosophy
        </p>
        <ol className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-x-6">
          {PRINCIPLES.map((item, index) => (
            <li key={item.stage}>
              <div className="h-full border-t-2 border-indigo pt-5">
                <span className="text-h3 font-bold tabular-nums text-indigo">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-h4 font-bold">{item.stage}</h3>
                <p className="mt-1 text-small font-semibold text-kesar-700">
                  {item.title}
                </p>
                <p className="mt-2.5 text-small text-ink-secondary">
                  {item.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section containerSize="wide">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <SectionHeader
              layout="stack"
              eyebrow="Why We Exist"
              title="Because hard work deserves the right direction."
              description="UPSC preparation can become overwhelming: a vast syllabus, too many resources and limited feedback often leave even committed aspirants uncertain about what to prioritise."
            />
            <p className="mt-5 text-body text-ink-secondary">
              Vidyant IAS exists to make that effort more effective. We provide
              clear teaching, purposeful practice and guidance that helps
              students recognise what needs attention.
            </p>
            <ButtonLink
              href={ROUTES.counselling}
              variant="primary"
              className="mt-8"
            >
              Talk to an Academic Counsellor
            </ButtonLink>
          </div>

          <div>
            <p className="text-eyebrow font-semibold uppercase text-kesar-600">
              Our work addresses four essentials
            </p>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {ESSENTIALS.map((item) => (
                <li key={item.title}>
                  <Card tone="paper" className="h-full">
                    <h3 className="text-h4 font-bold">{item.title}</h3>
                    <p className="mt-2.5 text-small text-ink-secondary">
                      {item.detail}
                    </p>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section id="approach" tone="paper" containerSize="wide">
        <SectionHeader
          eyebrow="Our Approach"
          title="Structured in method. Personal in guidance."
          description="Every aspirant follows the same examination syllabus, but not the same learning journey. Our approach combines a consistent academic framework with support tailored to individual needs."
        />

        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
          {APPROACH.map((step, index) => (
            <li key={step.title}>
              <Card className="h-full">
                <span className="text-small font-bold tabular-nums text-kesar-600">
                  Step {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-h4 font-bold">{step.title}</h3>
                <p className="mt-2.5 text-small text-ink-secondary">
                  {step.detail}
                </p>
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="indigo" containerSize="default">
        <SectionHeader
          tone="light"
          layout="stack"
          eyebrow="Our Commitment"
          title="Teaching with integrity. Guiding with purpose."
          description="We are committed to responsible teaching, constructive evaluation and meaningful faculty–student engagement. Students should feel comfortable asking questions, recognising mistakes and improving through consistent effort."
        />
        <p className="mt-6 text-body text-white/80">
          There are no shortcuts to the Civil Services Examination. Our
          responsibility is to provide the academic foundation and considered
          guidance that help aspirants prepare independently and with
          confidence.
        </p>
        <p className="mt-10 text-eyebrow font-semibold uppercase tracking-widest text-kesar">
          Vidyant IAS · Right Knowledge. Right Direction. Every Step.
        </p>
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
          <PlaceholderVisual
            imageKey="library"
            tone="paper"
            className="aspect-4/3 w-full lg:aspect-video"
          />
          <PlaceholderVisual
            imageKey="selfStudy"
            tone="paper"
            className="aspect-4/3 w-full lg:aspect-video"
          />
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
      </Section>

      <CTASection
        title="Come and see how we teach."
        description="Attend a demo class, walk through the centre, and decide with evidence rather than a brochure."
        location="about-final"
      />
    </>
  );
}
