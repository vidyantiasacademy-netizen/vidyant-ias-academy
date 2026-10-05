import { MessageSquareQuote } from "lucide-react";

import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { TestimonialCard } from "@/components/testimonials/TestimonialCard";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CTASection } from "@/components/ui/CTASection";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { publishedTestimonials } from "@/data/testimonials";
import { CTA, ROUTES } from "@/lib/constants/site";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Student Testimonials",
  description:
    "Written and video testimonials from vidyantIAS students, published only with consent. Until our first cohort completes, this page says so plainly.",
  path: ROUTES.testimonials,
});

export default function TestimonialsPage() {
  const testimonials = publishedTestimonials;

  return (
    <>
      <PageHero
        eyebrow="Student Voices"
        title="What our students say"
        description="Every testimonial here is from a student who gave permission for it to be published, and who can be contacted to confirm it."
        breadcrumbs={[{ label: "Home", href: ROUTES.home }, { label: "Testimonials" }]}
      />

      <Section containerSize="wide">
        {testimonials.length > 0 ? (
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {testimonials.map((testimonial) => (
              <li key={testimonial.id}>
                <TestimonialCard testimonial={testimonial} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={<MessageSquareQuote aria-hidden className="size-5" />}
            title="Our first cohort is preparing right now"
            description="vidyantIAS is a new institute. There are no student testimonials yet, and we would rather show an empty page than words no student said. Until then, the honest way to judge us is to attend a demo class and speak to the faculty directly."
            action={
              <div className="flex flex-col gap-3 sm:flex-row">
                <ButtonLink href={CTA.demo.href} variant="primary">
                  {CTA.demo.label}
                </ButtonLink>
                <ButtonLink href={CTA.counselling.href} variant="secondary">
                  {CTA.counselling.label}
                </ButtonLink>
              </div>
            }
          />
        )}
      </Section>

      <Section tone="paper" containerSize="default">
        <SectionHeader
          eyebrow="Our policy"
          title="How testimonials get published here"
        />
        <Card className="mt-10">
          <ol className="space-y-4 text-body text-ink-secondary">
            <li>
              <span className="font-semibold text-indigo">1. The student writes it.</span> We do
              not draft quotes for students to approve.
            </li>
            <li>
              <span className="font-semibold text-indigo">2. Consent is recorded.</span> Name,
              photograph and video are used only where permission was given for each.
            </li>
            <li>
              <span className="font-semibold text-indigo">3. It stays accurate.</span> We
              publish the program and year, so a reader knows the context of the experience.
            </li>
          </ol>
        </Card>
      </Section>

      <CTASection
        title="Form your own opinion first."
        description="Attend a class, ask the faculty hard questions, then decide."
        location="testimonials-final"
      />
    </>
  );
}
