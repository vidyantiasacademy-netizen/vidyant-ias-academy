import { AppError, ERROR_CODES } from "@/lib/errors";

/**
 * Browser-safe Firebase configuration.
 *
 * Every value here is public by design — a Firebase web config identifies the
 * project, it does not authorise anything. Access control is Security Rules plus
 * the Admin SDK, never secrecy of these ids. Server-only credentials live in
 * `admin.ts` and are read from different variables.
 *
 * `storageBucket` is deliberately absent: files are in Cloudinary, and the
 * browser never addresses the media account directly.
 */

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

const RAW = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
} as const;

const REQUIRED_KEYS = [
  "apiKey",
  "authDomain",
  "projectId",
  "messagingSenderId",
  "appId",
] as const;

/**
 * True when Firebase is wired up. Call this before rendering anything that
 * needs auth, so an unconfigured environment degrades to a clear message
 * instead of a crash — the public marketing site must keep building and serving
 * with no Firebase project at all.
 */
export function isFirebaseConfigured(): boolean {
  return REQUIRED_KEYS.every((key) => Boolean(RAW[key]));
}

/** Throws `CONFIG_ERROR` rather than handing the SDK a half-empty config. */
export function getFirebaseClientConfig(): FirebaseClientConfig {
  const missing = REQUIRED_KEYS.filter((key) => !RAW[key]);

  if (missing.length > 0) {
    throw new AppError(ERROR_CODES.CONFIG_ERROR, {
      message: "Sign-in is not available yet.",
      cause: new Error(
        `Missing Firebase client env: ${missing
          .map((key) => `NEXT_PUBLIC_FIREBASE_${camelToEnv(key)}`)
          .join(", ")}`,
      ),
    });
  }

  return {
    apiKey: RAW.apiKey!,
    authDomain: RAW.authDomain!,
    projectId: RAW.projectId!,
    messagingSenderId: RAW.messagingSenderId!,
    appId: RAW.appId!,
    measurementId: RAW.measurementId,
  };
}

function camelToEnv(key: string): string {
  return key.replace(/([A-Z])/g, "_$1").toUpperCase();
}
