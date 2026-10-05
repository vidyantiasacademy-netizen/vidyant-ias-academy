import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore";

import { getFirebaseClientConfig } from "./config";

/**
 * Firebase Web SDK, for the browser.
 *
 * Every accessor is lazy. Nothing initialises at import time, so a route that
 * merely imports a module in this folder still prerenders in an environment
 * with no Firebase credentials — which is how the public site builds today.
 *
 * Use this from Client Components for sign-in UI and real-time listeners.
 * Everything else — reads a page renders, every mutation that matters, anything
 * a student must not be able to forge — goes through the services in
 * `src/services`, which run on the server against the Admin SDK.
 *
 * Files are not here at all: media lives in Cloudinary, and a browser upload
 * goes through `lib/cloudinary/upload.ts` with a signature from the server.
 */

const APP_NAME = "vidyantias";

export function getFirebaseApp(): FirebaseApp {
  const existing = getApps().find((app) => app.name === APP_NAME);
  if (existing) return getApp(APP_NAME);

  return initializeApp(getFirebaseClientConfig(), APP_NAME);
}

/**
 * Set by `npm run dev:emulator` only. An explicit flag rather than
 * `NODE_ENV === "development"`, so a plain `npm run dev` still talks to the
 * real project — someone debugging a production sign-in issue locally should
 * not be silently pointed at an empty emulator.
 */
const USE_EMULATORS = process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATORS === "true";

let authEmulatorConnected = false;
let dbEmulatorConnected = false;

export function getFirebaseAuth(): Auth {
  const auth = getAuth(getFirebaseApp());

  // Must happen once, before the first sign-in; a second call throws.
  if (USE_EMULATORS && !authEmulatorConnected) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    authEmulatorConnected = true;
  }

  return auth;
}

export function getFirebaseDb(): Firestore {
  const db = getFirestore(getFirebaseApp());

  if (USE_EMULATORS && !dbEmulatorConnected) {
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    dbEmulatorConnected = true;
  }

  return db;
}

/**
 * Analytics and Messaging are deliberately not initialised here.
 *
 * Both are browser-only, both need a support check, and both would pull their
 * SDK chunk into the bundle of every page that imports this module. Add them as
 * separate lazily-imported modules (`analytics.ts`, `messaging.ts`) when the
 * features land:
 *
 *   const { getAnalytics, isSupported } = await import("firebase/analytics")
 *   if (await isSupported()) getAnalytics(getFirebaseApp())
 *
 * Note that `lib/analytics` already provides a provider-agnostic `track()`
 * facade — wire Firebase Analytics in behind that, not alongside it.
 */
