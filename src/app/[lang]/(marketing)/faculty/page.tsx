import { FacultyFilters } from "@/components/faculty/FacultyFilters";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { CTASection } from "@/components/ui/CTASection";
import { getLocale } from "@/i18n/server";
import { getFacultyRoster } from "@/lib/faculty/roster";
import { ROUTES } from "@/lib/constants/site";
import { pageMetadata } from "@/lib/seo/metadata";
import type { FacultyArea } from "@/types";

export const generateMetadata = () => pageMetadata({
  title: "UPSC Faculty in Pune",
  description:
    "Meet the vidyantIAS teaching panel — General Studies, Optional subjects, Essay, Ethics and CSAT faculty who teach the classes and evaluate the answers written in their subject.",
  path: ROUTES.faculty,
  keywords: ["UPSC faculty Pune", "IAS teachers Pune", "UPSC coaching Pune"],
});

const FILTERS: { id: FacultyArea | "all"; label: string }[] = [
  { id: "all", label: "All faculty" },
  { id: "gs", label: "General Studies" },
  { id: "optional", label: "Optional" },
  { id: "essay", label: "Essay" },
  { id: "ethics", label: "Ethics" },
  { id: "csat", label: "CSAT" },
];

export default async function FacultyPage() {
  const members = await getFacultyRoster(await getLocale());
  const awaitingProfiles = members.some((member) => member.isPlaceholder);

  return (
    <>
      <PageHero
        eyebrow="Faculty"
        title="Meet the people guiding your preparation."
        description="Teaching, testing and evaluation are handled by the same subject faculty — so the feedback on your answer comes from the person who taught the topic."
        breadcrumbs={[{ label: "Home", href: ROUTES.home }, { label: "Faculty" }]}
      />

      <Section containerSize="wide">
        <FacultyFilters members={members} filters={FILTERS} />

        {awaitingProfiles ? (
          <Card tone="paper" className="mt-10">
            <h2 className="text-h4 font-semibold">Profiles are being verified</h2>
            <p className="mt-3 max-w-3xl text-body text-ink-secondary">
              vidyantIAS publishes a faculty member&apos;s name, qualifications and experience
              only after verifying them. Until each profile is confirmed, the cards above
              describe the teaching role rather than making claims we cannot yet support. For
              the current panel teaching your batch, ask during counselling or attend a demo
              class.
            </p>
          </Card>
        ) : null}
      </Section>

      <CTASection
        title="Judge the teaching, not the brochure."
        description="Attend a free demo class and see how a subject is actually taught before you enrol."
        location="faculty-final"
      />
    </>
  );
}
