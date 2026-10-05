/**
 * Seeds the local Firebase emulators with two logins, so the course → enrol →
 * test → result flow can be walked through end to end without touching the
 * real project.
 *
 *   npm run firebase:emulators   # terminal 1
 *   npm run emulator:seed        # terminal 2, once the emulators are up
 *   npm run dev:emulator         # terminal 2
 *
 * Refuses to run unless both emulator hosts are set: with them missing, the
 * Admin SDK would happily write these accounts into the live project.
 *
 * Safe to re-run — every write is an upsert keyed by a fixed uid.
 */

import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

if (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  console.error(
    "Refusing to seed: FIRESTORE_EMULATOR_HOST and FIREBASE_AUTH_EMULATOR_HOST must both be set.\n" +
      "Run this through `npm run emulator:seed`.",
  );
  process.exit(1);
}

const PROJECT_ID = process.env.EMULATOR_PROJECT_ID ?? "vidyantias";
const PASSWORD = "test1234";

const ACCOUNTS = [
  {
    uid: "emulator-admin",
    email: "admin@vidyant.test",
    displayName: "Test Admin",
    role: "SUPER_ADMIN",
    phone: null,
  },
  {
    uid: "emulator-student",
    email: "student@vidyant.test",
    displayName: "Test Student",
    role: "STUDENT",
    phone: "9999999999",
  },
];

const app = getApps()[0] ?? initializeApp({ projectId: PROJECT_ID });
const auth = getAuth(app);
const db = getFirestore(app);

const audit = (uid) => ({
  createdAt: FieldValue.serverTimestamp(),
  updatedAt: FieldValue.serverTimestamp(),
  createdBy: uid,
  updatedBy: uid,
});

for (const account of ACCOUNTS) {
  try {
    await auth.getUser(account.uid);
    await auth.updateUser(account.uid, { email: account.email, password: PASSWORD });
  } catch {
    await auth.createUser({
      uid: account.uid,
      email: account.email,
      password: PASSWORD,
      displayName: account.displayName,
      emailVerified: true,
    });
  }

  // The claim is what the session reads; the `users` document has to agree, or
  // the first sign-in's `ensureUserDocuments` would find nothing and reset the
  // account to STUDENT.
  await auth.setCustomUserClaims(account.uid, { role: account.role, active: true });

  await db.collection("users").doc(account.uid).set({
    uid: account.uid,
    role: account.role,
    email: account.email,
    phone: account.phone,
    displayName: account.displayName,
    photoPath: null,
    isActive: true,
    lastLoginAt: null,
    ...audit(account.uid),
  });

  if (account.role === "STUDENT") {
    await db.collection("students").doc(account.uid).set(
      {
        uid: account.uid,
        rollNumber: "VID-TEST-0001",
        fullName: account.displayName,
        phone: account.phone,
        email: account.email,
        dateOfBirth: null,
        city: null,
        state: null,
        optionalSubject: null,
        preparationStage: null,
        attemptsGiven: 0,
        targetExamYear: null,
        activeEnrollmentIds: [],
        mentorUid: null,
        notes: null,
        ...audit(account.uid),
      },
      { merge: true },
    );
  }

  console.log(`✓ ${account.role.padEnd(11)} ${account.email} / ${PASSWORD}`);
}

console.log(`\nSeeded project "${PROJECT_ID}". Emulator UI: http://127.0.0.1:4000`);
