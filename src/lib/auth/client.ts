"use client";

import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";

import { notifyAuthChanged } from "@/lib/auth/events";
import { toAppError } from "@/lib/errors";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { toFirebaseAppError } from "@/lib/firebase/errors";

import type { Role } from "./types";

/**
 * Browser-side authentication.
 *
 * Components call these, never `firebase/auth` directly, because every sign-in
 * has a second mandatory half: exchanging the ID token for the httpOnly session
 * cookie that the server reads. A component that called
 * `signInWithEmailAndPassword` itself would appear signed in while every Server
 * Component still saw an anonymous visitor.
 *
 * Enabled provider: email/password only. Google sign-in was removed on
 * purpose: it lets anyone with a Google account create an account here, and
 * `createSession` rejects it server-side too. Phone auth is planned — it needs
 * a reCAPTCHA verifier and an OTP step, and slots in here as
 * `signInWithPhone()` returning a confirmation handle; nothing outside this
 * module has to change.
 */

/** Posts the ID token to the server, which mints the session cookie. */
async function syncSessionCookie(user: FirebaseUser): Promise<void> {
  const idToken = await user.getIdToken(true);

  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    // The client is signed in but the server is not. Undo it, so the two never
    // disagree about who is logged in.
    await firebaseSignOut(getFirebaseAuth()).catch(() => undefined);

    const body = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;

    throw toAppError(new Error(body?.message ?? "Could not start your session."));
  }

  notifyAuthChanged();
}

export interface SignInResult {
  uid: string;
  role: Role;
}

async function resolveRole(user: FirebaseUser): Promise<Role> {
  const token = await user.getIdTokenResult();
  return (token.claims.role as Role | undefined) ?? "STUDENT";
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<SignInResult> {
  try {
    const { user } = await signInWithEmailAndPassword(
      getFirebaseAuth(),
      email,
      password,
    );

    await syncSessionCookie(user);
    return { uid: user.uid, role: await resolveRole(user) };
  } catch (error) {
    throw toFirebaseAppError(error);
  }
}

/**
 * Creates the Auth user and the session, then returns. The `users/{uid}` and
 * `students/{uid}` documents are created server-side by
 * `POST /api/auth/session` on first sign-in — a client that wrote its own
 * `users` document could choose its own role.
 */
export async function signUpWithEmail(input: {
  email: string;
  password: string;
  fullName: string;
}): Promise<SignInResult> {
  try {
    const { user } = await createUserWithEmailAndPassword(
      getFirebaseAuth(),
      input.email,
      input.password,
    );

    await updateProfile(user, { displayName: input.fullName });
    await syncSessionCookie(user);

    return { uid: user.uid, role: await resolveRole(user) };
  } catch (error) {
    throw toFirebaseAppError(error);
  }
}

export async function sendPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(getFirebaseAuth(), email);
  } catch (error) {
    throw toFirebaseAppError(error);
  }
}

/** Clears the session cookie first, then the client state. */
export async function signOut(): Promise<void> {
  await fetch("/api/auth/session", { method: "DELETE" }).catch(() => undefined);
  notifyAuthChanged();

  try {
    await firebaseSignOut(getFirebaseAuth());
  } catch (error) {
    throw toFirebaseAppError(error);
  }
}

/**
 * Refreshes the session cookie from the current client token.
 *
 * Needed because the session cookie outlives the one-hour ID token: without
 * this, a role change made during a long session is not reflected server-side
 * until the next sign-in. `AuthProvider` calls it on `onIdTokenChanged`.
 */
export async function refreshSessionCookie(user: FirebaseUser): Promise<void> {
  await syncSessionCookie(user);
}
