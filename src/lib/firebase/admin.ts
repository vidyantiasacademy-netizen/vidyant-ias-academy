import "server-only";

import {
  applicationDefault,
  cert,
  getApp,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

import { AppError, ERROR_CODES } from "@/lib/errors";

/**
 * Firebase Admin SDK — server only.
 *
 * The `server-only` import on line 1 is the safeguard: if any Client Component
 * ever pulls this module in, directly or through a barrel, the build fails with
 * a module-resolution error instead of shipping a service-account key to the
 * browser. Do not remove it, and do not re-export this module from a file that
 * a Client Component imports.
 *
 * The Admin SDK bypasses Security Rules entirely. Every function here is a
 * root-level key to the database, so callers must do their own authorisation —
 * use `requireAuth()` / `requireRole()` from `lib/auth/server.ts` first.
 *
 * Auth and Firestore only. Files are in Cloudinary — see
 * `lib/cloudinary/client.ts`.
 */

const APP_NAME = "vidyantias-admin";

/**
 * Two credential paths, preferred first:
 *
 * 1. Application Default Credentials — what Cloud Run, App Engine, Cloud
 *    Functions and `gcloud auth application-default login` provide. No secret
 *    in any env var, no key to rotate. Use this in production where possible.
 * 2. An explicit service account from env vars, for platforms that cannot
 *    attach a Google identity (Vercel, Netlify, a local machine without
 *    gcloud). `FIREBASE_PRIVATE_KEY` is PEM text, so when the host stores it on
 *    one line the `\n` sequences have to be turned back into newlines.
 *
 * A service-account JSON file is never read from disk and must never be
 * committed — `.gitignore` already covers `*.json` service accounts via the
 * `.env*` rule only, so keep the file out of the repo entirely.
 */
function resolveCredential() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GCP_PROJECT) {
    return { credential: applicationDefault(), projectId };
  }

  if (projectId && clientEmail && privateKey) {
    return {
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
      projectId,
    };
  }

  throw new AppError(ERROR_CODES.CONFIG_ERROR, {
    cause: new Error(
      "Firebase Admin is not configured. Provide either GOOGLE_APPLICATION_CREDENTIALS " +
        "(preferred) or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY.",
    ),
  });
}

/** True when the server can talk to Firebase. Checked by `/api/auth/session`. */
export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      process.env.GCP_PROJECT ||
      (process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_CLIENT_EMAIL &&
        process.env.FIREBASE_PRIVATE_KEY),
  );
}

export function getAdminApp(): App {
  const existing = getApps().find((app) => app?.name === APP_NAME);
  if (existing) return getApp(APP_NAME);

  const { credential, projectId } = resolveCredential();

  return initializeApp({ credential, projectId }, APP_NAME);
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function getAdminDb(): Firestore {
  const db = getFirestore(getAdminApp());

  // `undefined` fields are a write error by default, which turns every optional
  // TypeScript field into a runtime throw — hence `ignoreUndefinedProperties`.
  //
  // `settings()` may only be called once per Firestore instance, and a
  // module-level "already applied" flag is not enough to guarantee that: a
  // Route Handler and the RSC renderer get separate module instances, while the
  // Firestore object itself is cached on the shared Admin app. The second graph
  // then sees its own flag unset, calls `settings()` on an instance that is
  // already configured, and throws "Firestore has already been initialized" —
  // which surfaced as a 500 on the first authenticated page render after a
  // sign-in. Catching it is the only reliable guard.
  try {
    db.settings({ ignoreUndefinedProperties: true });
  } catch {
    // Already configured by another module instance. Nothing to do.
  }

  return db;
}
