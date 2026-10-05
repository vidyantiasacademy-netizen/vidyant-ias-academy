/**
 * Cloudinary public ids, and the reference strings stored in Firestore.
 *
 * The public id *is* the access-control boundary: `assertCanRead()` and
 * `assertCanWrite()` in `services/storage/storage.service.ts` authorise on the
 * prefix, so every asset has to be addressed through a builder here rather than
 * an ad-hoc template string somewhere in a component. A typo that lands a
 * student answer sheet outside `students/{uid}/` would make it readable by the
 * wrong people.
 *
 * Two different strings are in play, and mixing them up is the easy mistake:
 *
 * - a **public id** — `users/abc/avatar/1712-photo`, no extension. This is what
 *   Cloudinary stores an asset under, and what the builders below return.
 * - a **media reference** — `users/abc/avatar/1712-photo.jpg`, the public id
 *   plus the format Cloudinary decided on. This is what goes in Firestore
 *   (`users/{uid}.photoPath`, `lessons/{id}.storagePath`) and what
 *   `storageService.getSignedUrl()` takes, because a time-limited Cloudinary
 *   download URL has to be signed over the id *and* the format.
 *
 * Everything is uploaded with delivery type `authenticated`, so neither the
 * original nor any derived version is reachable without a signature. Reads go
 * through `storageService.getSignedUrl()`, which authorises the caller and
 * mints a URL that expires in minutes.
 */

export const MEDIA_PATHS = {
  /** Profile photos. Owner-writable, staff-readable. */
  userAvatar: (uid: string, name: string) => `users/${uid}/avatar/${name}`,

  /** Anything else a user uploads about themselves (ID proof, documents). */
  userDocument: (uid: string, name: string) => `users/${uid}/documents/${name}`,

  /** Course-level study material. Readable only by enrolled students. */
  courseDocument: (courseId: string, name: string) =>
    `courses/${courseId}/documents/${name}`,

  courseImage: (courseId: string, name: string) => `courses/${courseId}/images/${name}`,

  /** A lesson's handout or slide deck. */
  lessonDocument: (courseId: string, lessonId: string, name: string) =>
    `courses/${courseId}/lessons/${lessonId}/${name}`,

  /** Question papers and keys. Faculty and admins only — never students. */
  testDocument: (testId: string, name: string) => `tests/${testId}/${name}`,

  /** Images embedded in a question (maps, passages, data tables). */
  questionImage: (questionId: string, name: string) => `questions/${questionId}/${name}`,

  /** Photographed Mains answer sheets. The student writes, faculty reads. */
  studentAnswerSheet: (studentUid: string, attemptId: string, name: string) =>
    `students/${studentUid}/answers/${attemptId}/${name}`,

  /** Attachments on a doubt. */
  doubtAttachment: (studentUid: string, doubtId: string, name: string) =>
    `students/${studentUid}/doubts/${doubtId}/${name}`,

  /** Faculty credentials and contracts. Admins only. */
  facultyDocument: (uid: string, name: string) => `faculty/${uid}/documents/${name}`,
} as const;

/** Upload limits. Enforced server-side in `storage.service.ts`. */
export const UPLOAD_LIMITS = {
  image: { maxBytes: 2 * 1024 * 1024, mimeTypes: ["image/jpeg", "image/png", "image/webp"] },
  document: { maxBytes: 25 * 1024 * 1024, mimeTypes: ["application/pdf"] },
  answerSheet: {
    maxBytes: 15 * 1024 * 1024,
    mimeTypes: ["image/jpeg", "image/png", "application/pdf"],
  },
} as const;

export type UploadKind = keyof typeof UPLOAD_LIMITS;

/**
 * Which Cloudinary resource type an upload belongs to.
 *
 * PDFs included: Cloudinary treats a PDF as an `image` resource, which is what
 * lets a question paper be delivered page by page later. Nothing in this app
 * stores a `raw` asset — video goes to Mux — so an unexpected type is a bug
 * rather than a case to fall back on.
 */
export const RESOURCE_TYPE = "image" as const;

/**
 * Strips directory traversal, spaces, dots and anything else that would let a
 * filename escape its prefix or confuse the format suffix. The extension is
 * dropped deliberately: Cloudinary decides the format from the bytes, and the
 * public id must not carry one of its own.
 */
export function safeAssetName(name: string): string {
  const withoutExtension = name.replace(/\.[^.]{1,12}$/, "");

  const cleaned = withoutExtension
    .normalize("NFKD")
    .replace(/[^\w-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(-100);

  return cleaned || "file";
}

/** `safeAssetName` plus a timestamp prefix, so re-uploads never overwrite. */
export function uniqueAssetName(name: string): string {
  return `${Date.now()}-${safeAssetName(name)}`;
}

/** Joins a public id and the format Cloudinary reported into a stored reference. */
export function toMediaRef(publicId: string, format: string): string {
  return `${publicId}.${format}`;
}

/**
 * Splits a stored reference back into the pair a signed download URL needs.
 *
 * The split is on the *last* dot, because a public id may legitimately contain
 * none and must never contain one of its own — see `safeAssetName`.
 */
export function fromMediaRef(ref: string): { publicId: string; format: string } {
  const dot = ref.lastIndexOf(".");

  if (dot <= 0 || dot === ref.length - 1) {
    return { publicId: ref, format: "" };
  }

  return { publicId: ref.slice(0, dot), format: ref.slice(dot + 1) };
}
