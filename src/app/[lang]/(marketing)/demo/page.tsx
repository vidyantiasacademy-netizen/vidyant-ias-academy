import { ClipboardCheck, Presentation, Users } from "lucide-react";

import { DemoForm } from "@/components/forms/DemoForm";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { getLocale } from "@/i18n/server";
import { ROUTES } from "@/lib/constants/site";
import { getCourseCatalogue } from "@/lib/courses/catalogue";
import { pageMetadata } from "@/lib/seo/metadata";

export const generateMetadata = () => pageMetadata({
  title: "Free UPSC Demo Class in Pune",
  description:
    "Attend a free vidyantIAS demo class in Pune or online. See how a session is taught, how answers are evaluated and how mentorship works before you enrol.",
  path: ROUTES.demo,
  keywords: ["UPSC demo class Pune", "IAS demo class Pune", "UPSC coaching Pune"],
});

const WHAT_YOU_SEE = [
  {
    icon: Presentation,
    title: "A real class, not a sales pitch",
    description: "You sit in a scheduled session and see exactly how a topic is taught.",
  },
  {
    icon: ClipboardCheck,
    title: "How practice is built in",
    description:
      "Every class ends with questions. You see the standard of practice we expect.",
  },
  {
    icon: Users,
    title: "The people you would learn from",
    description: "Meet the faculty and ask about the syllabus, tests and evaluation.",
  },
];

export default async function DemoPage() {
  const courses = await getCourseCatalogue(await getLocale());

  return (
    <>
      <PageHero
        eyebrow="Demo Classes"
        title="Experience the vidyantIAS classroom."
        description="Attend a live or recorded demo class and understand our teaching approach before enrolling. Register below and our team will confirm your slot."
        breadcrumbs={[{ label: "Home", href: ROUTES.home }, { label: "Demo Classes" }]}
      />

      <Section containerSize="wide">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:gap-14">
          <DemoForm courses={courses} />

          <aside className="flex flex-col gap-4">
            <Card tone="paper">
              <h2 className="text-h4 font-bold">What you will see</h2>
              <ul className="mt-5 space-y-5">
                {WHAT_YOU_SEE.map(({ icon: Icon, title, description }) => (
                  <li key={title} className="flex gap-3">
                    <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-kesar-600" />
                    <span>
                      <span className="block text-body font-semibold text-indigo">{title}</span>
                      <span className="text-small text-ink-secondary">{description}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <h2 className="text-h4 font-bold">Good to know</h2>
              <ul className="mt-4 space-y-3 text-small text-ink-secondary">
                <li>Demo classes are free and carry no obligation to enrol.</li>
                <li>
                  Slots depend on the running batch schedule — we confirm the exact date and
                  time with you.
                </li>
                <li>
                  Attending online? We share the joining link before the session begins.
                </li>
              </ul>
            </Card>
          </aside>
        </div>
      </Section>
    </>
  );
}
