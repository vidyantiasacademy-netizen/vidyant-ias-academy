/**
 * Publishes the sample Mains answer-writing paper, so any student enrolled in
 * the Mains Program can open it, write it, and submit it for evaluation.
 *
 *   npm run seed:answer-writing                            # project in .env.local
 *   npm run seed:answer-writing -- --course=test-series    # another course
 *   npm run seed:answer-writing -- --days=14               # deadline 14 days out (default 30)
 *   npm run seed:answer-writing -- --force                 # replace its PDF and settings
 *   npm run seed:answer-writing -- --dry-run               # print, write nothing
 *
 * Writes to the Firestore emulator instead when FIRESTORE_EMULATOR_HOST is set.
 * Cloudinary has no emulator, so the PDF always goes to the Cloudinary account
 * in .env.local — point that at a development environment (docs/cloudinary.md).
 *
 * Idempotent: the paper has a fixed id, so a second run finds it and stops.
 * `--force` replaces the PDF and settings, but refuses once any student has a
 * copy — their answers were written against the paper as it is.
 */

import { existsSync } from "node:fs";

import { v2 as cloudinary } from "cloudinary";
import { cert, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

import {
  SAMPLE_PAPER,
  buildSamplePaperPdf,
  markingSchemeOf,
  totalMarksOf,
} from "./answer-writing/sample-paper.mjs";

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name, fallback) =>
  args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;

const dryRun = flag("dry-run");
const force = flag("force");
const courseId = option("course", "mains-program");
const openDays = Number(option("days", "30"));

if (!Number.isFinite(openDays) || openDays < 1) {
  console.error("--days must be a whole number of days, 1 or more.");
  process.exit(1);
}

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const useEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);

if (useEmulator) {
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

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

if (!dryRun && (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET)) {
  console.error("CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET must be set — the question paper is stored there.");
  process.exit(1);
}

const db = getFirestore();
const ref = db.collection("tests").doc(SAMPLE_PAPER.testId);

console.log(
  `Firestore: ${useEmulator ? `emulator (${process.env.FIRESTORE_EMULATOR_HOST})` : process.env.FIREBASE_PROJECT_ID}` +
    `${dryRun ? " — dry run" : ""}\n`,
);

const course = await db.collection("courses").doc(courseId).get();

if (!course.exists) {
  console.error(
    `Course "${courseId}" does not exist. Create it first — \`npm run seed:courses:firestore\`, or Admin → Courses ` +
      "on the emulator — or pass --course=<id>.",
  );
  process.exit(1);
}

const existing = await ref.get();

if (existing.exists && !force) {
  console.log(`  skip    ${SAMPLE_PAPER.testId} — already exists. Pass --force to replace its PDF and settings.`);
  process.exit(0);
}

if (existing.exists) {
  const copies = await db
    .collection("answerSubmissions")
    .where("testId", "==", SAMPLE_PAPER.testId)
    .limit(1)
    .get();

  if (!copies.empty) {
    console.error(`  refuse  ${SAMPLE_PAPER.testId} — students already have copies of this paper.`);
    process.exit(1);
  }
}

const now = new Date();
const paper = {
  courseId,
  batchId: null,
  title: SAMPLE_PAPER.title,
  kind: "mains-descriptive",
  subject: SAMPLE_PAPER.subject,
  questionCount: SAMPLE_PAPER.questions.length,
  totalMarks: totalMarksOf(),
  durationMinutes: SAMPLE_PAPER.durationMinutes,
  negativeMarksPerQuestion: 0,
  opensAt: now.toISOString(),
  closesAt: new Date(now.getTime() + openDays * 86_400_000).toISOString(),
  // Each copy goes back to its student as soon as it is evaluated.
  resultsVisibleFrom: null,
  security: null,
  audience: "enrolled",
  markingScheme: markingSchemeOf(),
  status: "published",
};

if (dryRun) {
  console.log(JSON.stringify({ id: SAMPLE_PAPER.testId, ...paper, questionPaperPath: "(set on a real run)" }, null, 2));
  process.exit(0);
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

// The same shape as the app's own uploads: authenticated delivery, a
// timestamped id under the paper's `paper/` folder (MEDIA_PATHS.testQuestionPaper),
// never overwriting.
const upload = await new Promise((resolve, reject) => {
  cloudinary.uploader
    .upload_stream(
      {
        public_id: `tests/${SAMPLE_PAPER.testId}/paper/${Date.now()}-sample-paper-01`,
        resource_type: "image",
        type: "authenticated",
        overwrite: false,
        headers: "X-Robots-Tag: noindex",
      },
      (error, result) => (error || !result ? reject(error ?? new Error("Cloudinary returned no result")) : resolve(result)),
    )
    .end(buildSamplePaperPdf());
});

const questionPaperPath = `${upload.public_id}.${upload.format}`;

await ref.set(
  {
    ...paper,
    questionPaperPath,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: "system",
    ...(existing.exists ? {} : { createdAt: FieldValue.serverTimestamp(), createdBy: "system" }),
  },
  { merge: true },
);

console.log(`  ${existing.exists ? "replace" : "create "} ${SAMPLE_PAPER.testId} — ${SAMPLE_PAPER.title}`);
console.log(`          course ${courseId} (${course.get("title") ?? "untitled"}), published`);
console.log(`          open now, due ${paper.closesAt}`);
console.log(`          question paper ${questionPaperPath}`);
console.log(
  "\nStudents with an active enrollment in that course see it under Mains Answer Writing.\n" +
    "Faculty evaluate submitted copies under Admin → Answer Writing.",
);
