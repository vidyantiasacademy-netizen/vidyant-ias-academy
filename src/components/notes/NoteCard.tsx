import { Download } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TrackedAnchor, TrackedLink } from "@/components/ui/TrackedLink";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { ROUTES } from "@/lib/constants/site";
import { pdfVersion } from "@/lib/notes/version";
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

/**
 * The watermarked download (`/notes/<slug>/pdf`), versioned by the upload so
 * the CDN can keep each version for good.
 */
export function pdfDownloadHref(note: Pick<StudyNoteListItem, "pdfUrl" | "slug">) {
  return `${ROUTES.notes}/${note.slug}/pdf?v=${pdfVersion(note.pdfUrl)}`;
}

/** "8-page PDF · 1.4 MB · Revised 3 Nov 2026" */
export function noteMeta(note: StudyNoteListItem) {
  return [
    note.pages ? `${note.pages}-page PDF` : "PDF",
    formatBytes(note.pdfSize),
    `Revised ${formatRevised(note.revisedAt)}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

/**
 * One note: subject, title, what it covers, and the download, with its page
 * count and size so a student on mobile data knows the cost before tapping.
 * The title opens the note's own page, the link a student shares.
 */
export function NoteCard({ note, headingLevel = "h3" }: { note: StudyNoteListItem; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
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
          href={`${ROUTES.notes}/${note.slug}`}
          event={ANALYTICS_EVENTS.noteOpen}
          payload={payload}
          className="hover:underline hover:decoration-kesar hover:decoration-2 hover:underline-offset-4"
        >
          {note.title}
        </TrackedLink>
      </Heading>
      <p className="mt-2 line-clamp-3 text-small text-ink-secondary">{note.summary}</p>
      <p className="mt-3 text-[0.8125rem] text-ink-muted">{noteMeta(note)}</p>

      {/* Pushes the download to the card foot, so a row of cards lines up. */}
      <div aria-hidden className="flex-1" />
      <div className="mt-4 border-t border-line pt-4">
        <TrackedAnchor
          href={pdfDownloadHref(note)}
          event={ANALYTICS_EVENTS.noteDownload}
          payload={payload}
          className="inline-flex min-h-11 items-center gap-2 bg-indigo px-4 text-small font-bold text-white transition-colors hover:bg-indigo-900"
        >
          <Download aria-hidden className="size-4" />
          Download PDF
        </TrackedAnchor>
      </div>
    </article>
  );
}
