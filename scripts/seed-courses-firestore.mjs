/**
 * Seeds `courses/{courseId}` in the Firestore project named in `.env.local`.
 *
 *   npm run seed:courses:firestore              # writes
 *   npm run seed:courses:firestore -- --dry-run # prints what it would write
 *
 * Idempotent and non-destructive:
 *  - a course that does not exist yet is created, published, with no price;
 *  - a course that already exists is left alone, except that an empty
 *    `sanitySlug` is filled in so it joins its Sanity copy.
 * Prices, modes, durations and status set in the admin panel are never
 * overwritten. Run `seed-courses-sanity.mjs` as well, or nothing is listed:
 * the site shows a course only when both halves exist.
 */
import { cert, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

import { SEED_COURSES } from "./seed/courses.mjs";

const dryRun = process.argv.includes("--dry-run");

process.loadEnvFile(".env.local");

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

const db = getFirestore();

console.log(`Firestore project: ${FIREBASE_PROJECT_ID}${dryRun ? " (dry run)" : ""}\n`);

for (const { firestore: course, existing } of SEED_COURSES) {
  const ref = db.collection("courses").doc(course.id);
  const snapshot = await ref.get();

  if (snapshot.exists) {
    if (snapshot.get("sanitySlug")) {
      console.log(`  skip    ${course.id} — exists, already linked to "${snapshot.get("sanitySlug")}"`);
      continue;
    }

    console.log(`  link    ${course.id} — sanitySlug = "${snapshot.get("slug")}"`);
    if (!dryRun) {
      await ref.update({
        sanitySlug: snapshot.get("slug"),
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: "system",
      });
    }
    continue;
  }

  if (existing) {
    console.warn(`  missing ${course.id} — expected an admin-created course; not creating it`);
    continue;
  }

  const slugTaken = await db.collection("courses").where("slug", "==", course.slug).limit(1).get();
  if (!slugTaken.empty) {
    console.warn(`  skip    ${course.id} — slug "${course.slug}" is used by ${slugTaken.docs[0].id}`);
    continue;
  }

  console.log(`  create  ${course.id}`);
  if (!dryRun) {
    await ref.set({
      slug: course.slug,
      title: course.title,
      category: course.category,
      modes: course.modes,
      price: course.price,
      durationMonths: course.durationMonths,
      status: "published",
      sanitySlug: course.slug,
      facultyUids: [],
      stats: { lessonCount: 0, testCount: 0, enrolledCount: 0 },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: "system",
      updatedBy: "system",
    });
  }
}

console.log("\nDone.");
