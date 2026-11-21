"use client";

import { getApps, initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  browserPopupRedirectResolver,
  connectAuthEmulator,
  inMemoryPersistence,
  initializeAuth,
  signInWithPopup,
  signOut,
  type Auth,
} from "firebase/auth";

import { getFirebaseClientConfig } from "./config";
import { toFirebaseAppError } from "./errors";

/**
 * Proves a visitor owns a Google account, for the free mock and PYQ tests.
 * One sitting per Google account per paper is what stops "type any number,
 * take it again". Free: no SMS, no third party beyond Firebase.
 *
 * Runs in its own Firebase app with in-memory persistence, apart from the
 * portal's sign-in (`lib/auth/client.ts`): a sign-in on the shared app would
 * replace a signed-in student in this browser. It lives for one popup and is
 * signed out straight after — never a session, since `createSession` refuses
 * any provider but email/password.
 *
 * The project must create a separate account per provider
 * (`allowDuplicateEmails`): in one-account-per-email mode a Google sign-in can
 * take over a student's unverified password account with the same address.
 */

const APP_NAME = "vidyantias-google-verify";
const USE_EMULATORS = process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATORS === "true";

let auth: Auth | null = null;

function verifyAuth(): Auth {
  if (auth) return auth;

  const app =
    getApps().find((existing) => existing.name === APP_NAME) ??
    initializeApp(getFirebaseClientConfig(), APP_NAME);

  auth = initializeAuth(app, {
    persistence: inMemoryPersistence,
    popupRedirectResolver: browserPopupRedirectResolver,
  });
  if (USE_EMULATORS) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  }
  return auth;
}

/**
 * Opens the Google popup and returns the ID token that proves the account to
 * the server. Call it straight from a click handler — browsers block a popup
 * opened after an `await`.
 */
export async function verifyWithGoogle(): Promise<string> {
  const provider = new GoogleAuthProvider();
  // Always offer the account chooser, so a shared computer is not a trap.
  provider.setCustomParameters({ prompt: "select_account" });

  try {
    const { user } = await signInWithPopup(verifyAuth(), provider);
    const token = await user.getIdToken();
    await signOut(verifyAuth()).catch(() => undefined);
    return token;
  } catch (error) {
    throw toFirebaseAppError(error);
  }
}
