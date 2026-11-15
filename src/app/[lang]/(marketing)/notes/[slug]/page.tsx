import { ArrowLeft, Download, FileText } from "lucide-react";
import { notFound } from "next/navigation";

import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/layout/Section";
import { NoteCard, formatBytes, noteMeta, pdfDownloadHref } from "@/components/notes/NoteCard";
import { Badge } from "@/components/ui/Badge";
import { CTASection } from "@/components/ui/CTASection";
import { TrackedAnchor, TrackedLink } from "@/components/ui/TrackedLink";
import { getLocale } from "@/i18n/server";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { ROUTES } from "@/lib/constants/site";
import { getStudyNote, getStudyNotes } from "@/lib/sanity/queries";
import { pageMetadata } from "@/lib/seo/metadata";
import { absoluteUrl, jsonLd, studyNoteSchema } from "@/lib/seo/structured-data";

export async function generateStaticParams() {
  const slugs = new Set((await getStudyNotes()).map((note) => note.slug));
  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/notes/[slug]">) {
  const { slug } = await params;
  const note = await getStudyNote(slug, await getLocale());

  if (!note) {
    return pageMetadata({
      title: "Note not found",
      description: "This note is no longer published.",
      path: `${ROUTES.notes}/${slug}`,
      noIndex: true,
    });
  }

  return pageMetadata({
    title: note.seo?.title ?? `${note.title} — UPSC Notes PDF`,
    description: note.seo?.description ?? note.summary,
    path: `${ROUTES.notes}/${note.slug}`,
    noIndex: note.seo?.noIndex ?? false,
    type: "article",
    modifiedTime: note.revisedAt,
  });
}

const downloadButton =
  "inline-flex min-h-12 items-center gap-2 bg-indigo px-5 text-body font-bold text-white transition-colors hover:bg-indigo-900";

/** A note is a PDF; this page is where its link lands: what it covers, then the download. */
export default async function NotePage({ params }: PageProps<"/[lang]/notes/[slug]">) {
  const { slug } = await params;
  const locale = await getLocale();
  const [note, all] = await Promise.all([getStudyNote(slug, locale), getStudyNotes(locale)]);

  if (!note) notFound();

  const size = formatBytes(note.pdfSize);
  const payload = { location: "note-page", note: note.slug, subject: note.subject ?? "" };
  // Keep the student in the subject: the next notes they would download.
  const related = all.filter((n) => n.slug !== note.slug && n.subject === note.subject).slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            studyNoteSchema({
              title: note.title,
              summary: note.summary,
              slug: note.slug,
              locale,
              subject: note.subject,
              stages: note.stages,
              revisedAt: note.revisedAt,
              pdfUrl: absoluteUrl(pdfDownloadHref(note), locale),
            }),
          ),
        }}
      />
      <PageHero
        eyebrow={note.subject ?? "Notes"}
        title={note.title}
        description={note.summary}
        breadcrumbs={[
          { label: "Home", href: ROUTES.home },
          { label: "Notes", href: ROUTES.notes },
          { label: note.title },
        ]}
      >
        {note.stages.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {note.stages.map((stage) => (
              <li key={stage}>
                <Badge tone="kesar">{stage}</Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </PageHero>

      <Section containerSize="narrow">
        <div className="flex flex-col items-start gap-5 border border-line-strong bg-paper p-6 sm:flex-row sm:items-center">
          <FileText aria-hidden className="size-10 shrink-0 text-kesar-600" />
          <div className="flex-1">
            <p className="text-body font-bold text-indigo">{note.title}</p>
            <p className="mt-1 text-small text-ink-secondary">{noteMeta(note)}</p>
          </div>
          <TrackedAnchor
            href={pdfDownloadHref(note)}
            event={ANALYTICS_EVENTS.noteDownload}
            payload={payload}
            className={downloadButton}
          >
            <Download aria-hidden className="size-5" />
            Download PDF{size ? ` · ${size}` : ""}
          </TrackedAnchor>
        </div>
        <p className="mt-3 text-small text-ink-muted">Free to keep, print and share.</p>

        <TrackedLink
          href={ROUTES.notes}
          event={ANALYTICS_EVENTS.noteOpen}
          payload={{ ...payload, action: "back-to-library" }}
          className="mt-10 inline-flex min-h-11 items-center gap-2 text-small font-bold text-indigo"
        >
          <ArrowLeft aria-hidden className="size-4" />
          All notes
        </TrackedLink>
      </Section>

      {related.length > 0 ? (
        <Section tone="paper" containerSize="wide">
          <h2 className="border-t-2 border-indigo pt-3 text-h3 font-bold text-indigo">
            More {note.subject} notes
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {related.map((item) => (
              <li key={item._id}>
                <NoteCard note={item} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <CTASection
        title="Read it. Now test it."
        description="Sit a free timed mock, or talk to a counsellor about turning these notes into a plan for your attempt."
        location="note-detail-final"
      />
    </>
  );
}
