import { ArrowRight, Download } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TrackedAnchor, TrackedLink } from "@/components/ui/TrackedLink";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { ROUTES } from "@/lib/constants/site";
import type { StudyNoteListItem } from "@/lib/sanity/types";

/** "1.4 MB" — shown before a download, for students on mobile data. */
export function formatBytes(bytes: number | null) {
  if (!bytes) return null;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** `revisedAt` is a calendar date; format in UTC so it never shifts a day. */
export function formatRevised(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

/** Sanity serves a file as a download (not inline) with `?dl=<filename>`. */
export function pdfDownloadHref(note: Pick<StudyNoteListItem, "pdfUrl" | "slug">) {
  return note.pdfUrl ? `${note.pdfUrl}?dl=${encodeURIComponent(`${note.slug}.pdf`)}` : null;
}

/** "12 min read · 8-page PDF · Revised 3 Nov 2026" */
export function noteMeta(note: StudyNoteListItem) {
  return [
    note.hasContent && note.readingMinutes ? `${note.readingMinutes} min read` : null,
    note.pdfUrl ? (note.pages ? `${note.pages}-page PDF` : "PDF") : null,
    `Revised ${formatRevised(note.revisedAt)}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

/**
 * One free note: subject, title, what it covers, and the two ways to use it —
 * read it on the page, or download the PDF (with its size, so a student on
 * mobile data knows the cost before tapping).
 */
export function NoteCard({ note, headingLevel = "h3" }: { note: StudyNoteListItem; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  const readHref = `${ROUTES.notes}/${note.slug}`;
  const download = pdfDownloadHref(note);
  const size = formatBytes(note.pdfSize);
  const payload = { location: "notes-card", note: note.slug, subject: note.subject ?? "" };

  return (
    <article className="flex h-full flex-col border border-line-strong bg-white p-5 transition-colors hover:border-indigo">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {note.subject ? <Eyebrow>{note.subject}</Eyebrow> : <span />}
        {note.stages.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {note.stages.map((stage) => (
              <li key={stage}>
                <Badge tone="neutral">{stage}</Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <Heading className="mt-3 text-h4 font-bold text-indigo">
        <TrackedLink
          href={readHref}
          event={ANALYTICS_EVENTS.noteOpen}
          payload={payload}
          className="hover:underline hover:decoration-kesar hover:decoration-2 hover:underline-offset-4"
        >
          {note.title}
        </TrackedLink>
      </Heading>
      <p className="mt-2 line-clamp-3 text-small text-ink-secondary">{note.summary}</p>
      <p className="mt-3 text-[0.8125rem] text-ink-muted">{noteMeta(note)}</p>

      {/* Pushes the actions to the card foot, so a row of cards lines up. */}
      <div aria-hidden className="flex-1" />
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4">
        {note.hasContent ? (
          <TrackedLink
            href={readHref}
            event={ANALYTICS_EVENTS.noteOpen}
            payload={payload}
            className="inline-flex min-h-11 items-center gap-1.5 text-small font-bold text-indigo"
          >
            Read note
            <ArrowRight aria-hidden className="size-4" />
          </TrackedLink>
        ) : null}
        {download ? (
          <TrackedAnchor
            href={download}
            event={ANALYTICS_EVENTS.noteDownload}
            payload={payload}
            className="inline-flex min-h-11 items-center gap-1.5 text-small font-bold text-indigo underline decoration-line-strong decoration-2 underline-offset-4 hover:decoration-kesar"
          >
            <Download aria-hidden className="size-4" />
            PDF{size ? ` · ${size}` : ""}
          </TrackedAnchor>
        ) : null}
      </div>
    </article>
  );
}
