import { CalendarClock, FileCheck2, PhoneCall, Users } from "lucide-react";

import { BatchCard } from "@/components/batches/BatchCard";
import { CallbackForm } from "@/components/forms/CallbackForm";
import { EnrolmentForm } from "@/components/forms/EnrolmentForm";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CTASection } from "@/components/ui/CTASection";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { upcomingBatches } from "@/data/batches";
import { getLocale } from "@/i18n/server";
import { BROCHURE, CTA, EXAM_CYCLE, ROUTES } from "@/lib/constants/site";
import { getCourseCatalogue } from "@/lib/courses/catalogue";
import { pageMetadata, SEO_KEYWORDS } from "@/lib/seo/metadata";

export const generateMetadata = () => pageMetadata({
  title: `Admissions & Batches — ${EXAM_CYCLE.label}`,
  description:
    "Enrol at vidyantIAS Pune for UPSC CSE 2026. Batch start dates, modes of attendance, the admission steps and a transparent fee conversation — no payment is taken online.",
  path: ROUTES.enrol,
  keywords: [...SEO_KEYWORDS.primary, "UPSC admission Pune", "UPSC batch Pune"],
});

const STEPS = [
  {
    icon: FileCheck2,
    title: "Send your details",
    description:
      "The form below tells us your programme, your attempt status and how you want to attend.",
  },
  {
    icon: PhoneCall,
    title: "Talk to the academic team",
    description:
      "We confirm the batch, walk through the fee structure and instalment options, and answer every question before anything is paid.",
  },
  {
    icon: Users,
    title: "Meet your mentor",
    description:
      "Once enrolled you are assigned a mentor, a test calendar and a study plan for your target attempt.",
  },
];

export default async function EnrolPage() {
  const courses = await getCourseCatalogue(await getLocale());
  const batches = upcomingBatches();

  return (
    <>
      <PageHero
        eyebrow="Admissions"
        title={`Enrol for ${EXAM_CYCLE.label}.`}
        description="Three steps, no online payment and no pressure. Admission is confirmed on a call with our academic team so you know exactly what you are joining."
        breadcrumbs={[{ label: "Home", href: ROUTES.home }, { label: "Admissions" }]}
      />

      <Section containerSize="wide">
        <SectionHeader
          eyebrow="How admission works"
          title="What happens after you apply."
        />
        <ol className="mt-12 grid gap-4 lg:grid-cols-3 lg:gap-5">
          {STEPS.map(({ icon: Icon, title, description }, index) => (
            <li key={title}>
              <Card className="h-full">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-md bg-paper text-kesar-600">
                    <Icon aria-hidden className="size-5" />
                  </span>
                  <span className="text-eyebrow font-semibold uppercase text-ink-muted">
                    Step {index + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-h4 font-semibold">{title}</h3>
                <p className="mt-3 text-body text-ink-secondary">{description}</p>
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="paper" id="batches" containerSize="wide">
        <SectionHeader
          eyebrow="Batch calendar"
          title="Batches taking admissions now."
          description="Every batch below has a confirmed start date. Seats are allotted in the order enrolments are completed."
        />

        {batches.length > 0 ? (
          <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {batches.map((batch) => (
              <li key={batch.id} id={batch.slug} className="scroll-mt-28">
                <BatchCard batch={batch} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            className="mt-12"
            icon={<CalendarClock aria-hidden className="size-5" />}
            title="Dates for the next batches are being finalised"
            description="We publish a start date only once the academic calendar is fixed. Send the form below or ask for a callback and you will hear from us the day it is confirmed."
            action={
              <ButtonLink href="#enrolment-form" variant="primary">
                Register for the next batch
              </ButtonLink>
            }
          />
        )}
      </Section>

      <Section containerSize="wide">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:gap-14">
          <div id="enrolment-form" className="scroll-mt-28">
            <EnrolmentForm courses={courses} batches={batches} />
          </div>

          <aside className="flex flex-col gap-4">
            <Card tone="paper">
              <h2 className="text-h4 font-semibold">About fees</h2>
              <p className="mt-3 text-body text-ink-secondary">
                Fees differ by programme and batch, so we share the full structure — including
                instalments and what is covered — during the admission call rather than
                printing a number that may not apply to you.
              </p>
              <ButtonLink href={ROUTES.brochure} variant="link" className="mt-4 px-0">
                {CTA.brochure.label}
              </ButtonLink>
              <p className="mt-2 text-small text-ink-muted">{BROCHURE.note}</p>
            </Card>

            <Card>
              <h2 className="text-h4 font-semibold">Not ready to enrol?</h2>
              <p className="mt-3 text-body text-ink-secondary">
                Attend a free demo class or book a counselling session first. Neither commits
                you to anything.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <ButtonLink href={CTA.demo.href} variant="secondary">
                  {CTA.demo.label}
                </ButtonLink>
                <ButtonLink href={CTA.counselling.href} variant="secondary">
                  {CTA.counselling.label}
                </ButtonLink>
              </div>
            </Card>

            <CallbackForm source="enrol-page" id="callback" />
          </aside>
        </div>
      </Section>

      <CTASection
        title="Still deciding between programmes?"
        description="Tell our academic team where you are in your preparation and they will recommend the batch that fits — not the most expensive one."
        location="enrol-final"
      />
    </>
  );
}
