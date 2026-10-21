/**
 * Rewrites stored paper and result times as UTC `Z` strings.
 *
 *   node scripts/migrate-utc-instants.mjs           # report what would change
 *   node scripts/migrate-utc-instants.mjs --write   # change it
 *
 * Papers used to store their schedule as typed, in IST (`2026-10-20T10:00:00+05:30`),
 * while the server compares against `new Date().toISOString()` (`…Z`). As text
 * the two disagree by five and a half hours, so papers opened, closed and
 * released results at the wrong time. The app now compares instants and
 * normalises new writes (`src/lib/utils/instant.ts`); this brings documents
 * written before that into line, so text ordering — a Firestore `orderBy` on
 * `opensAt` — is right too.
 *
 * Each value keeps the same moment, only its spelling changes, so nothing a
 * student or faculty member sees moves. Audit fields are left alone for the
 * same reason: no one edited these papers. Safe to re-run; a second run finds
 * nothing. Uses the Firestore emulator when FIRESTORE_EMULATOR_HOST is set.
 */

import { existsSync } from "node:fs";

import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const write = process.argv.includes("--write");

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

if (process.env.FIRESTORE_EMULATOR_HOST) {
  initializeApp({ projectId: process.env.EMULATOR_PROJECT_ID ?? "vidyantias" });
} else {
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    console.error("FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY must be set in .env.local.");
    process.exit(1);
  }

  initializeApp({
    credential: cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

const TARGETS = [
  { collection: "tests", fields: ["opensAt", "closesAt", "resultsVisibleFrom"] },
  { collection: "results", fields: ["publishedAt"] },
];

console.log(
  `Firestore: ${process.env.FIRESTORE_EMULATOR_HOST ? "emulator" : process.env.FIREBASE_PROJECT_ID}` +
    `${write ? "" : " — report only, pass --write to apply"}\n`,
);

let changed = 0;
let unparseable = 0;

for (const { collection, fields } of TARGETS) {
  const snapshot = await db.collection(collection).get();
  const updates = [];

  for (const doc of snapshot.docs) {
    const patch = {};

    for (const field of fields) {
      const value = doc.get(field);
      if (typeof value !== "string" || value.endsWith("Z")) continue;

      const instant = Date.parse(value);
      if (Number.isNaN(instant)) {
        console.warn(`  skip    ${collection}/${doc.id}.${field} — not a date: ${JSON.stringify(value)}`);
        unparseable += 1;
        continue;
      }

      patch[field] = new Date(instant).toISOString();
      console.log(`  ${write ? "update" : "would "}  ${collection}/${doc.id}.${field}: ${value} → ${patch[field]}`);
    }

    if (Object.keys(patch).length > 0) updates.push({ ref: doc.ref, patch });
  }

  // A Firestore batch takes at most 500 writes.
  for (let start = 0; write && start < updates.length; start += 400) {
    const batch = db.batch();
    for (const { ref, patch } of updates.slice(start, start + 400)) batch.update(ref, patch);
    await batch.commit();
  }

  changed += updates.reduce((sum, { patch }) => sum + Object.keys(patch).length, 0);
  console.log(`  ${collection}: ${snapshot.size} documents, ${updates.length} with offset times\n`);
}

console.log(
  changed === 0
    ? "Nothing to change — every stored time is already UTC."
    : `${changed} value${changed === 1 ? "" : "s"} ${write ? "rewritten" : "to rewrite"}.`,
);
if (unparseable > 0) console.log(`${unparseable} value(s) were not dates and were left alone.`);
