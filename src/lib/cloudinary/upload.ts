import { AppError, ERROR_CODES } from "@/lib/errors";

import { UPLOAD_LIMITS, toMediaRef, type UploadKind } from "./media-paths";

/**
 * Browser-side uploads.
 *
 * Files go straight from the device to Cloudinary rather than through a Route
 * Handler, because a 15 MB answer-sheet photo would otherwise occupy a
 * serverless function for the whole upload. What authorises the write is a
 * per-file signature from `/api/uploads/signature`, which checks the caller
 * against the requested public id before signing — see
 * `storageService.signUpload()`. No unsigned upload preset is involved: one
 * would let anybody holding the cloud name write into the account.
 *
 * The checks here fail fast with a readable message. They are not the control:
 * the signature is, and the format whitelist in it is what Cloudinary enforces.
 *
 * Reads work the other way round: never construct a Cloudinary URL on the
 * client. Ask the server for one via `storageService.getSignedUrl()`, so the
 * caller's enrollment can be checked first.
 */

export interface UploadOptions {
  /** Which limit set to enforce. */
  kind: UploadKind;
  /** 0–100, called as the upload progresses. */
  onProgress?: (percent: number) => void;
}

interface UploadTicket {
  uploadUrl: string;
  fields: Record<string, string>;
}

/** Validates against `UPLOAD_LIMITS` before a byte leaves the device. */
export function assertUploadable(file: File, kind: UploadKind): void {
  const limit = UPLOAD_LIMITS[kind];

  if (file.size > limit.maxBytes) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, {
      message: `This file is too large. The limit is ${Math.floor(
        limit.maxBytes / (1024 * 1024),
      )} MB.`,
    });
  }

  if (!(limit.mimeTypes as readonly string[]).includes(file.type)) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, {
      message: `This file type is not accepted. Allowed: ${limit.mimeTypes
        .map((type) => type.split("/")[1].toUpperCase())
        .join(", ")}.`,
    });
  }
}

/**
 * Uploads one file and resolves with its media reference — not a URL. Store the
 * reference in Firestore; resolve it to a signed URL at read time.
 *
 * `path` is a public id from `MEDIA_PATHS`, without an extension. The reference
 * that comes back carries the format Cloudinary derived from the bytes, which
 * is why it is built here from the response rather than from the filename.
 */
export async function uploadFile(
  path: string,
  file: File,
  { kind, onProgress }: UploadOptions,
): Promise<string> {
  assertUploadable(file, kind);

  const ticket = await requestTicket(path, kind);

  const body = new FormData();
  for (const [key, value] of Object.entries(ticket.fields)) {
    body.append(key, value);
  }
  body.append("file", file);

  const result = await post(ticket.uploadUrl, body, onProgress);

  return toMediaRef(result.public_id, result.format);
}

async function requestTicket(path: string, kind: UploadKind): Promise<UploadTicket> {
  const response = await fetch("/api/uploads/signature", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ path, kind }),
  });

  const payload = (await response.json().catch(() => null)) as
    | (UploadTicket & { message?: string })
    | null;

  if (!response.ok || !payload?.uploadUrl) {
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, {
      message: payload?.message ?? "This upload could not be started.",
    });
  }

  return { uploadUrl: payload.uploadUrl, fields: payload.fields };
}

/**
 * `XMLHttpRequest`, not `fetch`: upload progress is the whole point of a direct
 * upload on a phone connection, and `fetch` still cannot report it.
 */
function post(
  url: string,
  body: FormData,
  onProgress?: (percent: number) => void,
): Promise<{ public_id: string; format: string }> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open("POST", url);
    request.responseType = "json";

    if (onProgress) {
      request.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      });
    }

    request.addEventListener("load", () => {
      const result = request.response as
        | { public_id?: string; format?: string; error?: { message?: string } }
        | null;

      if (request.status >= 200 && request.status < 300 && result?.public_id) {
        resolve({ public_id: result.public_id, format: result.format ?? "" });
        return;
      }

      // Cloudinary's own message names formats and limits usefully, but it also
      // names the account, so it is logged rather than shown.
      console.error("[media] upload rejected", request.status, result?.error);

      reject(
        new AppError(ERROR_CODES.INTERNAL_ERROR, {
          message: "That file could not be uploaded. Please try again.",
        }),
      );
    });

    request.addEventListener("error", () => {
      reject(
        new AppError(ERROR_CODES.INTERNAL_ERROR, {
          message: "That file could not be uploaded. Check your connection.",
        }),
      );
    });

    request.send(body);
  });
}
