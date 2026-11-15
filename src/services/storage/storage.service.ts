import "server-only";

import type { UploadApiOptions, UploadApiResponse } from "cloudinary";

import { isAtLeast } from "@/lib/auth/roles";
import { requireAuth } from "@/lib/auth/server";
import { getCloudinary } from "@/lib/cloudinary/client";
import { getCloudinaryCredentials } from "@/lib/cloudinary/config";
import {
  MEDIA_PATHS,
  RESOURCE_TYPE,
  UPLOAD_LIMITS,
  fromMediaRef,
  toMediaRef,
  uniqueAssetName,
  type UploadKind,
} from "@/lib/cloudinary/media-paths";
import { AppError, ERROR_CODES } from "@/lib/errors";
import type { SessionUser } from "@/lib/auth/types";

import { courseService } from "../courses/course.service";
import { enrollmentService } from "../enrollments/enrollment.service";

/**
 * Private file access, backed by Cloudinary.
 *
 * Every asset is uploaded with delivery type `authenticated`, which means
 * neither the original nor any derived version is reachable from a plain
 * Cloudinary URL — a signature is required. No URL is ever stored in Firestore;
 * what is stored is a media reference (see `lib/cloudinary/media-paths.ts`),
 * and the server turns it into a URL only after authorising the caller.
 *
 * Reads use `private_download_url`, which carries an `expires_at` the CDN
 * enforces, so a leaked link dies in minutes. That matters because one shared
 * link to a ₹60,000 course's material would otherwise be permanent leakage. It
 * costs double the bandwidth and is not CDN-cached, which is the trade
 * accepted for expiry — do not embed these URLs anywhere long-lived.
 *
 * Cloudinary has no equivalent of Firebase Security Rules: there is no rules
 * file to fall back on, and an upload signed by this server is an upload
 * Cloudinary will accept. `assertCanRead()` and `assertCanWrite()` below are
 * therefore the whole of the access control, not a second line of defence.
 */

const DEFAULT_TTL_MINUTES = 10;

/** Who may read what, by public-id prefix. */
async function assertCanRead(path: string): Promise<void> {
  const user = await requireAuth();

  if (isAtLeast(user.role, "FACULTY")) return;

  // A user's own folder.
  if (path.startsWith(`users/${user.uid}/`)) return;
  if (path.startsWith(`students/${user.uid}/`)) return;

  // Course material: only with an active enrollment in that course.
  const course = path.match(/^courses\/([^/]+)\//);
  if (course) {
    if (await enrollmentService.hasAccess(user.uid, course[1])) return;

    throw new AppError(ERROR_CODES.FORBIDDEN, {
      message: "This material is part of a course you are not enrolled in.",
    });
  }

  // Question images, during a test the student is entitled to.
  if (path.startsWith("questions/")) return;

  throw new AppError(ERROR_CODES.FORBIDDEN);
}

/**
 * Who may write where. There is no rules file behind this; see the note above.
 *
 * A student may only write inside their own folders, and may not write over a
 * submitted answer sheet — the timestamped name in `uniqueAssetName()` plus
 * `overwrite: false` on the upload is what keeps that true. Everything about
 * course material, test papers and question images is staff-only.
 */
function assertCanWrite(user: SessionUser, path: string): void {
  const self =
    path.startsWith(`users/${user.uid}/`) || path.startsWith(`students/${user.uid}/`);

  if (self) return;

  if (/^(courses|tests|questions)\//.test(path) && isAtLeast(user.role, "FACULTY")) {
    return;
  }

  if (path.startsWith("faculty/") && isAtLeast(user.role, "ADMIN")) return;

  throw new AppError(ERROR_CODES.FORBIDDEN);
}

/** A short-lived read URL for one asset. */
export async function getSignedUrl(
  ref: string,
  ttlMinutes = DEFAULT_TTL_MINUTES,
): Promise<string> {
  await assertCanRead(ref);

  return sign(ref, ttlMinutes);
}

/**
 * A question image for a website visitor sitting a public mock test.
 *
 * Visitors have no session for `assertCanRead` to check, so this signs only
 * question images and nothing else. The caller — `mockTestService` — must
 * already have verified the visitor's attempt token and that the question is
 * on their paper.
 */
export async function getQuestionImageUrlForVisitor(
  ref: string,
  ttlMinutes = DEFAULT_TTL_MINUTES,
): Promise<string> {
  if (!ref.startsWith("questions/")) throw new AppError(ERROR_CODES.FORBIDDEN);

  return sign(ref, ttlMinutes);
}

/**
 * A Mains paper's question paper, for a student.
 *
 * `tests/` is staff-only in `assertCanRead`, because keys and model answers
 * live there too. This signs one folder of it — `tests/{testId}/paper/` — and
 * nothing else. The caller, `answerWritingService`, must already have checked
 * the student's enrollment and that the paper has opened.
 */
export function getQuestionPaperUrlForStudent(
  ref: string,
  ttlMinutes = DEFAULT_TTL_MINUTES,
): string {
  if (!/^tests\/[\w-]+\/paper\/[\w-]+\.pdf$/.test(ref)) {
    throw new AppError(ERROR_CODES.FORBIDDEN);
  }

  return sign(ref, ttlMinutes);
}

/**
 * The evaluator's annotated copy, for the student it belongs to.
 *
 * Kept under `tests/` rather than the student's own folder so that it cannot
 * be read before release — `assertCanRead` would hand a student anything in
 * `students/{uid}/`. The uid in the path must be the caller's; the release check
 * is `answerWritingService`'s, which must run before this.
 */
export async function getEvaluatedCopyUrlForStudent(
  ref: string,
  ttlMinutes = DEFAULT_TTL_MINUTES,
): Promise<string> {
  const user = await requireAuth();
  const owner = /^tests\/[\w-]+\/evaluated\/([^/]+)\/[\w-]+\.\w+$/.exec(ref)?.[1];

  if (owner !== user.uid) throw new AppError(ERROR_CODES.FORBIDDEN);

  return sign(ref, ttlMinutes);
}

function sign(ref: string, ttlMinutes: number): string {
  const { publicId, format } = fromMediaRef(ref);

  if (!format) {
    throw new AppError(ERROR_CODES.NOT_FOUND, {
      message: "This file could not be opened.",
      cause: new Error(`Media reference has no format suffix: ${ref}`),
    });
  }

  try {
    return getCloudinary().utils.private_download_url(publicId, format, {
      resource_type: RESOURCE_TYPE,
      type: "authenticated",
      expires_at: Math.floor(Date.now() / 1000) + ttlMinutes * 60,
      // Displayed, not downloaded: this URL is used as an `<img src>` and is
      // fetched by the I Card renderer. The download button is a route of ours.
      attachment: false,
    });
  } catch (error) {
    console.error("[media] signing failed", publicId, error);
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, {
      message: "This file could not be opened. Please try again.",
      cause: error,
    });
  }
}

/** The signed URL for a lesson's attached document, with the lesson check. */
export async function getLessonDocumentUrl(lessonId: string): Promise<string> {
  const lesson = await courseService.requireLessonAccess(lessonId);

  if (!lesson.storagePath) {
    throw new AppError(ERROR_CODES.NOT_FOUND, {
      message: "This lesson has no attached material.",
    });
  }

  return getSignedUrl(lesson.storagePath);
}

/** Deletes one asset by its stored reference. */
async function destroy(ref: string): Promise<void> {
  const { publicId } = fromMediaRef(ref);

  await getCloudinary().uploader.destroy(publicId, {
    resource_type: RESOURCE_TYPE,
    type: "authenticated",
    invalidate: true,
  });
}

/**
 * Deletes an asset. Staff only — a student deleting their own answer sheet
 * after submission would destroy evidence of what was evaluated.
 */
export async function remove(ref: string): Promise<void> {
  const user = await requireAuth();

  if (!isAtLeast(user.role, "ADMIN")) {
    throw new AppError(ERROR_CODES.FORBIDDEN);
  }

  await destroy(ref);
}

export interface AvatarUpload {
  bytes: ArrayBuffer | Uint8Array;
  contentType: string;
  fileName: string;
}

/**
 * Stores a profile photograph for the caller and returns its media reference.
 *
 * The type and size checks are here rather than only in the browser: the
 * request that reaches this function is one `fetch` away from anyone with a
 * session, so a client-side check is a courtesy, not a control.
 *
 * The asset is written under `users/{uid}/avatar/` with a timestamped name and
 * `overwrite: false`, so a re-upload can never overwrite — or be confused with
 * — the previous one.
 */
export async function uploadOwnAvatar(input: AvatarUpload): Promise<string> {
  const user = await requireAuth();
  return storeAvatar(user.uid, input);
}

/**
 * Stores a profile photograph for someone else — the super admin attaching a
 * photo while creating an account. Admin-only: `uploadOwnAvatar` is the only
 * path by which anyone else writes into a `users/{uid}/avatar/` folder.
 */
export async function uploadAvatarFor(uid: string, input: AvatarUpload): Promise<string> {
  const user = await requireAuth();

  if (!isAtLeast(user.role, "ADMIN")) {
    throw new AppError(ERROR_CODES.FORBIDDEN);
  }

  return storeAvatar(uid, input);
}

async function storeAvatar(uid: string, input: AvatarUpload): Promise<string> {
  const { maxBytes, mimeTypes } = UPLOAD_LIMITS.image;

  if (!(mimeTypes as readonly string[]).includes(input.contentType)) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, {
      message: "Upload a JPEG, PNG or WebP image.",
    });
  }

  const bytes = Buffer.from(input.bytes as ArrayBuffer);

  if (bytes.byteLength === 0) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, {
      message: "That file is empty.",
    });
  }

  if (bytes.byteLength > maxBytes) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, {
      message: `Photographs must be under ${Math.round(maxBytes / (1024 * 1024))} MB.`,
    });
  }

  const publicId = MEDIA_PATHS.userAvatar(uid, uniqueAssetName(input.fileName));

  try {
    const result = await uploadBuffer(bytes, {
      public_id: publicId,
      resource_type: RESOURCE_TYPE,
      type: "authenticated",
      overwrite: false,
      // Keep these assets out of search results. Authenticated assets are not
      // reachable without a signature, but a crawler that once saw a signed URL
      // should still not index a student's face.
      headers: "X-Robots-Tag: noindex",
    });

    return toMediaRef(result.public_id, result.format);
  } catch (error) {
    console.error("[media] avatar upload failed", publicId, error);
    throw toUploadError(error);
  }
}

/**
 * Deletes one of the caller's own previous avatars.
 *
 * Separate from `remove()`, which is admin-only on purpose: a student may tidy
 * up their own replaced photograph, but nothing else. The prefix check is what
 * keeps that true — without it this would delete any asset at all.
 */
export async function removeOwnAvatar(ref: string): Promise<void> {
  const user = await requireAuth();

  if (!ref.startsWith(`users/${user.uid}/avatar/`)) {
    throw new AppError(ERROR_CODES.FORBIDDEN);
  }

  await destroy(ref);
}

/**
 * Deletes a page the caller uploaded to their own answer sheet and then took
 * back out. The prefix keeps this to the caller's own answer folders; that the
 * copy is still an unsubmitted draft — so the page is not evidence of anything
 * evaluated — is `answerWritingService`'s check, made before calling this.
 */
export async function removeOwnAnswerSheetPage(ref: string): Promise<void> {
  const user = await requireAuth();

  if (!ref.startsWith(`students/${user.uid}/answers/`)) {
    throw new AppError(ERROR_CODES.FORBIDDEN);
  }

  await destroy(ref);
}

export interface UploadTicket {
  /** Where the browser POSTs the file. */
  uploadUrl: string;
  /** Form fields the POST has to carry, signature included. */
  fields: Record<string, string>;
}

/**
 * Signs one direct browser upload to a public id the caller is allowed to write.
 *
 * Large files — a 15 MB answer-sheet photograph — go straight from the device
 * to Cloudinary rather than through a Route Handler, which would otherwise
 * occupy a serverless function for the whole upload. The signature is what
 * authorises that single upload, so it is minted per file, for one exact public
 * id, and nothing else: no upload preset is used, because an unsigned preset
 * would let anyone with the cloud name write into the account.
 *
 * Note what a signature cannot do: Cloudinary enforces `allowed_formats` but
 * has no per-request byte cap, so the size limit for a direct upload is the
 * browser check in `lib/cloudinary/upload.ts` plus the account's own file-size
 * ceiling. Anything where the byte count is a real control has to be posted
 * through a Route Handler and checked here, the way avatars are.
 */
export async function signUpload(
  path: string,
  kind: UploadKind,
): Promise<UploadTicket> {
  const user = await requireAuth();

  assertCanWrite(user, path);

  if (!(kind in UPLOAD_LIMITS)) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR);
  }

  const { cloudName } = getCloudinaryCredentials();
  const cloudinary = getCloudinary();

  const allowedFormats = UPLOAD_LIMITS[kind].mimeTypes
    .map((mime) => (mime === "image/jpeg" ? "jpg,jpeg" : mime.split("/")[1]))
    .join(",");

  const params = {
    public_id: path,
    type: "authenticated",
    timestamp: Math.floor(Date.now() / 1000),
    overwrite: false,
    allowed_formats: allowedFormats,
    headers: "X-Robots-Tag: noindex",
  };

  // `sign_request` returns the params plus `api_key` and `signature`. The POST
  // must carry exactly these, byte for byte — Cloudinary re-signs what it
  // receives and rejects a mismatch.
  const signed = cloudinary.utils.sign_request(params);

  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/${RESOURCE_TYPE}/upload`,
    fields: Object.fromEntries(
      Object.entries(signed).map(([key, value]) => [key, String(value)]),
    ),
  };
}

/** `upload_stream` as a promise. The SDK is callback-only here. */
function uploadBuffer(
  bytes: Buffer,
  options: UploadApiOptions,
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = getCloudinary().uploader.upload_stream(options, (error, result) => {
      if (error || !result) {
        reject(error ?? new Error("Cloudinary returned no result"));
        return;
      }

      resolve(result);
    });

    stream.end(bytes);
  });
}

/**
 * Cloudinary's own errors are opaque about the one failure that is a setup
 * problem rather than a bug: bad or missing credentials. Say which it is, so it
 * is not debugged as a permissions problem.
 */
function toUploadError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  const message = error instanceof Error ? error.message : "";

  if (/api_key|api key|signature|disabled|unauthor/i.test(message)) {
    return new AppError(ERROR_CODES.CONFIG_ERROR, {
      message: "File uploads are not switched on yet. Please tell the centre.",
      cause: error,
    });
  }

  return new AppError(ERROR_CODES.INTERNAL_ERROR, {
    message: "That file could not be saved. Please try again.",
    cause: error,
  });
}

export const storageService = {
  getSignedUrl,
  getQuestionImageUrlForVisitor,
  getQuestionPaperUrlForStudent,
  getEvaluatedCopyUrlForStudent,
  getLessonDocumentUrl,
  remove,
  uploadOwnAvatar,
  uploadAvatarFor,
  removeOwnAvatar,
  removeOwnAnswerSheetPage,
  signUpload,
};
