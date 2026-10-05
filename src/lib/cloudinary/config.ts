import "server-only";

import { AppError, ERROR_CODES } from "@/lib/errors";

/**
 * Cloudinary credentials — server only.
 *
 * All three values are secrets in the sense that matters: the API key and
 * secret together sign upload requests and delivery URLs, so neither may ever
 * gain a `NEXT_PUBLIC_` prefix. The cloud name is not secret, but it is read
 * here rather than inlined into the bundle because the browser never builds a
 * Cloudinary URL itself — it asks `/api/uploads/signature` for one.
 *
 * Media is the only thing Cloudinary does in this app. Auth and Firestore are
 * still Firebase; see `lib/firebase/admin.ts`.
 */

export interface CloudinaryCredentials {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

const RAW = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
} as const;

/**
 * True when the server can talk to Cloudinary. Check this before rendering
 * anything that needs a file, so an unconfigured environment degrades to a
 * placeholder instead of a crash — the public marketing site has to keep
 * building and serving with no media account at all.
 */
export function isCloudinaryConfigured(): boolean {
  return Boolean(RAW.cloudName && RAW.apiKey && RAW.apiSecret);
}

/** Throws `CONFIG_ERROR` rather than handing the SDK a half-empty config. */
export function getCloudinaryCredentials(): CloudinaryCredentials {
  const missing = (Object.keys(RAW) as (keyof typeof RAW)[]).filter((key) => !RAW[key]);

  if (missing.length > 0) {
    throw new AppError(ERROR_CODES.CONFIG_ERROR, {
      message: "File uploads are not switched on yet. Please tell the centre.",
      cause: new Error(
        `Missing Cloudinary env: ${missing
          .map((key) => `CLOUDINARY_${key.replace(/([A-Z])/g, "_$1").toUpperCase()}`)
          .join(", ")}`,
      ),
    });
  }

  return {
    cloudName: RAW.cloudName!,
    apiKey: RAW.apiKey!,
    apiSecret: RAW.apiSecret!,
  };
}
