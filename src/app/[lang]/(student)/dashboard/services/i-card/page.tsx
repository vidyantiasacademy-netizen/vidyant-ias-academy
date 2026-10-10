import type { Metadata } from "next";
import { Download, IdCard } from "lucide-react";
import Image from "next/image";

import { PhotoUploadButton } from "@/components/portal/PhotoUploadButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { SopanMark } from "@/components/ui/SopanMark";
import { getCurrentStudent, getCurrentUserProfile } from "@/lib/auth/server";
import { BRAND } from "@/lib/constants/site";
import { courseService } from "@/services/courses/course.service";
import { storageService } from "@/services/storage/storage.service";

/**
 * The student identity card.
 *
 * Rendered from `students/{uid}` rather than stored as a file: the roll number,
 * name and programme already live there, and an image would go stale the moment
 * any of them changed. Printing is the browser's job.
 */
export const metadata: Metadata = {
  title: `I Card | ${BRAND.name}`,
  robots: { index: false, follow: false },
};

const FALLBACK_PHOTO = "/images/avatar-fallback.svg";

/**
 * A signed URL for the student's photo, or the fallback.
 *
 * The photograph is a Cloudinary `authenticated` asset, so the page mints a
 * ten-minute signed URL per request. A missing asset, a revoked key or a
 * signing failure all mean the same thing for this page — draw the placeholder
 * — so the failure is swallowed here rather than taking the whole card down.
 */
async function resolvePhoto(photoPath: string | null | undefined): Promise<string> {
  if (!photoPath) return FALLBACK_PHOTO;

  try {
    return await storageService.getSignedUrl(photoPath);
  } catch {
    return FALLBACK_PHOTO;
  }
}

export default async function ICardPage() {
  const [student, profile, enrolled] = await Promise.all([
    getCurrentStudent(),
    getCurrentUserProfile(),
    courseService.getEnrolledCourses(),
  ]);

  const photo = await resolvePhoto(profile?.photoPath);
  const hasPhoto = photo !== FALLBACK_PHOTO;

  const programme =
    enrolled.length > 0 ? enrolled.map(({ course }) => course.title).join(" · ") : "—";

  return (
    <>
      <h1 className="text-h2 font-bold">I Card</h1>

      {!student ? (
        <div className="mt-8">
          <EmptyState
            icon={<IdCard aria-hidden className="size-5" />}
            title="No student profile yet"
            description="Your card is generated once the centre completes your admission record."
          />
        </div>
      ) : (
        <div className="mt-8 max-w-lg">
          <div className="overflow-hidden border border-indigo-900/20 bg-indigo text-white">
            {/* Masthead. The mark's top step is kesar on its own; the only
                other saffron on the card is the roll number. */}
            <div className="flex items-center justify-between gap-4 px-6 pt-6">
              <span className="flex items-center gap-2.5">
                <SopanMark className="h-5 w-auto text-white" />
                <span className="text-body font-semibold">{BRAND.name}</span>
              </span>

              <span className="text-eyebrow font-semibold uppercase tracking-wide text-white/80">
                Student Identity
              </span>
            </div>

            <div aria-hidden className="mt-5 h-px bg-white/20" />

            <div className="flex gap-5 p-6">
              {/* Fixed frame: a portrait and the placeholder occupy the same
                  box, so the card does not reflow when a photo is added. */}
              <div className="relative size-28 shrink-0 overflow-hidden bg-indigo-900 ring-1 ring-white/25">
                <Image
                  src={photo}
                  alt={hasPhoto ? `Photograph of ${student.fullName}` : ""}
                  fill
                  sizes="112px"
                  // Signed URLs carry their credential in the query string and
                  // expire; the optimizer would cache the result under a stable
                  // URL of its own. Serve it straight through instead.
                  unoptimized={hasPhoto}
                  className="object-cover"
                />
              </div>

              <div className="min-w-0">
                {/* `globals.css` colours every h1–h4 Ink Indigo, which is
                    invisible on this card. Headings on an indigo surface have
                    to set their own colour. */}
                <h2 className="truncate text-h3 font-bold text-white">
                  {student.fullName}
                </h2>

                <p className="mt-1.5 text-small text-white/80">
                  {student.rollNumber ? "Roll number" : "Roll number pending"}
                </p>

                <p className="text-body-lg font-semibold tracking-wide text-kesar">
                  {student.rollNumber ?? "—"}
                </p>

                {!hasPhoto ? (
                  <p className="mt-3 text-small text-white/80">
                    No photograph on record yet.
                  </p>
                ) : null}
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-x-5 gap-y-4 border-t border-white/15 px-6 py-5 text-small">
              <div className="col-span-2">
                <dt className="text-white/80">Programme</dt>
                <dd className="mt-0.5 font-semibold">{programme}</dd>
              </div>

              <div>
                <dt className="text-white/80">Target year</dt>
                <dd className="mt-0.5 font-semibold">{student.targetExamYear ?? "—"}</dd>
              </div>

              <div>
                <dt className="text-white/80">Registered mobile</dt>
                <dd className="mt-0.5 font-semibold">{student.phone || "—"}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-5 flex flex-wrap items-start gap-3">
            <PhotoUploadButton hasPhoto={hasPhoto} />

            {/* A plain anchor, not `Link`: this points at a route handler that
                returns a file, and a client-side navigation would try to render
                the PNG as a page. */}
            <a
              href="/dashboard/services/i-card/download"
              download
              className="inline-flex h-12 items-center justify-center gap-2 border border-line-strong bg-white px-5 text-small font-semibold text-indigo transition-colors hover:border-indigo sm:text-body"
            >
              <Download aria-hidden className="size-4" />
              Download I Card
            </a>
          </div>

          <p className="mt-4 text-small text-ink-secondary">
            Carry this card on test days. You can change your photograph here;
            for any other correction, speak to the front desk — the centre edits
            that record, you cannot.
          </p>
        </div>
      )}
    </>
  );
}
