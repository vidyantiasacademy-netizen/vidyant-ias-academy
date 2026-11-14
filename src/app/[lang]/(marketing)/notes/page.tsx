import { NotebookPen } from "lucide-react";

import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { NotesLibrary } from "@/components/notes/NotesLibrary";
import { ButtonLink } from "@/components/ui/Button";
import { CTASection } from "@/components/ui/CTASection";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "@/i18n/Link";
import { getLocale } from "@/i18n/server";
import { ROUTES } from "@/lib/constants/site";
import { getStudyNotes } from "@/lib/sanity/queries";
import { pageMetadata } from "@/lib/seo/metadata";

export const generateMetadata = () => pageMetadata({
  title: "Free UPSC Notes, Subject-wise (PDF & Online)",
  description:
    "Free UPSC notes from vidyantIAS Pune, subject by subject: read them online or download the PDF. No sign-up and no form.",
  path: ROUTES.notes,
  keywords: ["free UPSC notes", "UPSC notes PDF", "IAS notes subject wise", "UPSC study notes"],
});

export default async function NotesPage() {
  const notes = await getStudyNotes(await getLocale());

  return (
    <>
      <PageHero
        eyebrow="Free Notes"
        title="Free UPSC notes, subject by subject."
        description="Read them here or download the PDF. No sign-up, no form, and every note shows when it was last revised."
        breadcrumbs={[{ label: "Home", href: ROUTES.home }, { label: "Free Notes" }]}
      />

      <Section containerSize="wide">
        {notes.length > 0 ? (
          <>
            <NotesLibrary notes={notes} />
            <p className="mt-10 border-t border-line pt-5 text-small text-ink-secondary">
              Also free: the syllabus, a booklist, PYQ strategy and a study planner.{" "}
              <Link
                href={ROUTES.resources}
                className="font-bold text-indigo underline decoration-2 underline-offset-4 hover:decoration-kesar"
              >
                Open free resources
              </Link>
            </p>
          </>
        ) : (
          // Honest empty state: no sample notes dressed up as real ones.
          <EmptyState
            icon={<NotebookPen aria-hidden className="size-5" />}
            title="The first notes are being written"
            description="Notes appear here as the faculty finish and check them. Until then, start with the syllabus, booklist and planner in our free resources."
            action={
              <ButtonLink href={ROUTES.resources} variant="primary">
                Open free resources
              </ButtonLink>
            }
          />
        )}
      </Section>

      <CTASection
        title="Notes are the start. A plan is what gets you through."
        description="A free counselling call turns what you are reading into a sequence with tests and review points for your attempt."
        location="notes-final"
      />
    </>
  );
}
