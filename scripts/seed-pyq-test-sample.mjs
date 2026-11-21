/**
 * Publishes a small sample PYQ test, so the /pyq-test flow — register as a
 * lead, sit the timed paper, read the analysis — can be tried end to end.
 *
 *   npm run seed:pyq-test                              # project in .env.local
 *   npm run seed:pyq-test -- --course=prelims-program  # file it under another course
 *   npm run seed:pyq-test -- --days=3                  # listed for 3 days (default 7)
 *   npm run seed:pyq-test -- --force                   # replace paper and questions
 *   npm run seed:pyq-test -- --remove                  # delete paper, questions and sittings
 *   npm run seed:pyq-test -- --dry-run                 # print, write nothing
 *
 * Writes to the Firestore emulator instead when FIRESTORE_EMULATOR_HOST is set.
 *
 * The paper is labelled as a sample everywhere a visitor sees it, and its
 * questions are NOT actual UPSC questions — they carry no `pyq` tag, so the
 * question bank never counts them as previous-year questions. It closes on its
 * own after `--days`, so a forgotten sample stops being listed.
 *
 * Idempotent: fixed ids, so a second run finds the paper and stops. `--force`
 * refuses once anyone has sat it — their scorecards were written against it.
 * `--remove` deletes the sittings too, but not the leads they created: those
 * are in `enquiries` with source `pyq-test`, and are yours to delete in Admin.
 */

import { existsSync } from "node:fs";

import { cert, initializeApp } from "firebase-admin/app";
import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name, fallback) =>
  args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;

const dryRun = flag("dry-run");
const force = flag("force");
const remove = flag("remove");
const courseId = option("course", "foundation-program");
const openDays = Number(option("days", "7"));

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

const TEST_ID = "sample-pyq-test-01";
const MARKS = 2;
const NEGATIVE = 0.66;

/** UPSC-style questions on settled facts. Not taken from any actual paper. */
const QUESTIONS = [
  {
    subject: "Polity",
    topic: "Fundamental Duties",
    difficulty: "easy",
    statement: "The Fundamental Duties were added to the Constitution of India by which Amendment Act?",
    options: ["24th Amendment Act", "42nd Amendment Act", "44th Amendment Act", "52nd Amendment Act"],
    correct: 1,
    explanation:
      "The 42nd Amendment Act, 1976 inserted Part IV-A (Article 51A) on the recommendation of the Swaran Singh Committee. The 44th (1978) undid several 42nd Amendment changes; the 52nd (1985) added the anti-defection Tenth Schedule.",
  },
  {
    subject: "Polity",
    topic: "Parliament",
    difficulty: "easy",
    statement: "Who presides over a joint sitting of the two Houses of Parliament?",
    options: [
      "The President of India",
      "The Vice-President of India",
      "The Speaker of the Lok Sabha",
      "The senior-most member of the Rajya Sabha",
    ],
    correct: 2,
    explanation:
      "Under Article 108 the President summons the joint sitting, but the Speaker of the Lok Sabha presides (Article 118(4)). In the Speaker's absence the Deputy Speaker, and then the Deputy Chairman of the Rajya Sabha, presides.",
  },
  {
    subject: "Polity",
    topic: "Fundamental Rights",
    difficulty: "moderate",
    statement: "Which Article of the Constitution guarantees the right to move the Supreme Court for the enforcement of Fundamental Rights?",
    options: ["Article 21", "Article 226", "Article 32", "Article 19"],
    correct: 2,
    explanation:
      "Article 32 is itself a Fundamental Right — Dr Ambedkar called it the 'heart and soul' of the Constitution. Article 226 empowers High Courts to issue writs, for Fundamental Rights and other legal rights alike.",
  },
  {
    subject: "History",
    topic: "Indian National Congress",
    difficulty: "easy",
    statement: "The first session of the Indian National Congress in 1885 was held at",
    options: ["Calcutta", "Bombay", "Madras", "Poona"],
    correct: 1,
    explanation:
      "The first session met at Gokuldas Tejpal Sanskrit College, Bombay, in December 1885, presided over by W. C. Bonnerjee. It had been planned for Poona but was moved because of a cholera outbreak there.",
  },
  {
    subject: "History",
    topic: "Gandhian movements",
    difficulty: "moderate",
    statement: "The Champaran Satyagraha of 1917 was launched against the forced cultivation of",
    options: ["Cotton", "Opium", "Indigo", "Jute"],
    correct: 2,
    explanation:
      "Under the tinkathia system, peasants in Champaran (Bihar) were made to grow indigo on 3/20th of their land. It was Gandhi's first satyagraha in India.",
  },
  {
    subject: "Geography",
    topic: "Indian physiography",
    difficulty: "moderate",
    statement: "The Tropic of Cancer does NOT pass through which of the following states?",
    options: ["Gujarat", "Odisha", "Tripura", "Jharkhand"],
    correct: 1,
    explanation:
      "The Tropic of Cancer crosses eight states: Gujarat, Rajasthan, Madhya Pradesh, Chhattisgarh, Jharkhand, West Bengal, Tripura and Mizoram. Odisha lies entirely south of it.",
  },
  {
    subject: "Geography",
    topic: "Drainage",
    difficulty: "easy",
    statement: "Which river basin is the largest in India by area?",
    options: ["Godavari", "Indus", "Brahmaputra", "Ganga"],
    correct: 3,
    explanation:
      "The Ganga basin covers roughly a quarter of India's land area. The Godavari basin is the largest among peninsular rivers.",
  },
  {
    subject: "Economy",
    topic: "Monetary policy",
    difficulty: "moderate",
    statement: "In India, the policy repo rate is decided by",
    options: [
      "The Union Ministry of Finance",
      "The Monetary Policy Committee",
      "The Governor of the RBI alone",
      "The Central Board of Directors of the RBI",
    ],
    correct: 1,
    explanation:
      "Since 2016, under the amended RBI Act, 1934, the six-member Monetary Policy Committee fixes the policy repo rate by majority vote, with the Governor holding a casting vote on a tie.",
  },
  {
    subject: "Economy",
    topic: "Taxation",
    difficulty: "moderate",
    statement: "The Goods and Services Tax (GST) was introduced in India through which Constitutional Amendment Act?",
    options: ["99th Amendment Act", "100th Amendment Act", "101st Amendment Act", "103rd Amendment Act"],
    correct: 2,
    explanation:
      "The 101st Amendment Act, 2016 inserted Article 246A and created the GST Council (Article 279A). GST came into force on 1 July 2017.",
  },
  {
    subject: "Environment",
    topic: "International conventions",
    difficulty: "easy",
    statement: "The Ramsar Convention is concerned with the conservation of",
    options: ["Migratory birds", "Wetlands", "Ozone layer", "Endangered species trade"],
    correct: 1,
    explanation:
      "The Ramsar Convention (1971, Ramsar, Iran) covers wetlands of international importance. Migratory species fall under the Bonn Convention (CMS), the ozone layer under the Vienna Convention and Montreal Protocol, and wildlife trade under CITES.",
  },
];

const OPTION_IDS = ["a", "b", "c", "d"];
const questionId = (index) => `${TEST_ID}-q${String(index + 1).padStart(2, "0")}`;

const db = getFirestore();
const testRef = db.collection("tests").doc(TEST_ID);

console.log(
  `Firestore: ${useEmulator ? `emulator (${process.env.FIRESTORE_EMULATOR_HOST})` : process.env.FIREBASE_PROJECT_ID}` +
    `${dryRun ? " — dry run" : ""}\n`,
);

const sittings = await db.collection("mockAttempts").where("testId", "==", TEST_ID).get();

if (remove) {
  if (dryRun) {
    console.log(`  would delete ${TEST_ID}, ${QUESTIONS.length} questions and ${sittings.size} sittings`);
    process.exit(0);
  }
  const batch = db.batch();
  batch.delete(testRef);
  QUESTIONS.forEach((_, index) => batch.delete(db.collection("questions").doc(questionId(index))));
  sittings.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  console.log(`  delete  ${TEST_ID}, ${QUESTIONS.length} questions, ${sittings.size} sittings`);
  if (sittings.size > 0) {
    console.log("          The leads those sittings created are still in Admin → Enquiries (source pyq-test).");
  }
  process.exit(0);
}

const course = await db.collection("courses").doc(courseId).get();

if (!course.exists) {
  console.error(
    `Course "${courseId}" does not exist. Run \`npm run seed:courses:firestore\` first, or pass --course=<id>.\n` +
      "A public paper is only filed under a course; visitors do not need to be enrolled in it.",
  );
  process.exit(1);
}

const existing = await testRef.get();

if (existing.exists && !force) {
  console.log(`  skip    ${TEST_ID} — already exists. Pass --force to replace it, or --remove to delete it.`);
  process.exit(0);
}

if (existing.exists && !sittings.empty) {
  console.error(`  refuse  ${TEST_ID} — ${sittings.size} sitting(s) exist. Run --remove first, then seed again.`);
  process.exit(1);
}

const now = new Date();
const paper = {
  courseId,
  batchId: null,
  title: "Sample PYQ Test — for testing only",
  kind: "prelims-mcq",
  subject: null,
  questionCount: QUESTIONS.length,
  totalMarks: QUESTIONS.length * MARKS,
  durationMinutes: 15,
  negativeMarksPerQuestion: NEGATIVE,
  opensAt: now.toISOString(),
  closesAt: new Date(now.getTime() + openDays * 86_400_000).toISOString(),
  // Key and explanations on the scorecard straight after submitting.
  resultsVisibleFrom: null,
  security: null,
  audience: "public",
  pyq: { exam: "Sample paper — not an actual UPSC paper", year: now.getFullYear() - 1 },
  status: "published",
};

const questions = QUESTIONS.map((question, index) => ({
  id: questionId(index),
  doc: {
    testIds: [TEST_ID],
    kind: "mcq-single",
    subject: question.subject,
    topic: question.topic,
    difficulty: question.difficulty,
    // Not real previous-year questions, so never tagged as one.
    pyq: null,
    statement: question.statement,
    imagePath: null,
    options: question.options.map((text, optionIndex) => ({ id: OPTION_IDS[optionIndex], text })),
    correctOptionIds: [OPTION_IDS[question.correct]],
    modelAnswer: null,
    explanation: question.explanation,
    keyApproach: null,
    currentAffairsLinkage: null,
    marks: MARKS,
    status: "published",
  },
}));

if (dryRun) {
  console.log(JSON.stringify({ id: TEST_ID, ...paper, questions }, null, 2));
  process.exit(0);
}

const batch = db.batch();
const audit = { updatedAt: FieldValue.serverTimestamp(), updatedBy: "system" };

batch.set(testRef, {
  ...paper,
  ...audit,
  createdAt: existing.exists ? existing.get("createdAt") : FieldValue.serverTimestamp(),
  createdBy: "system",
});

// A millisecond apart, so the admin screen lists them in authoring order.
questions.forEach(({ id, doc }, index) => {
  batch.set(db.collection("questions").doc(id), {
    ...doc,
    ...audit,
    createdAt: Timestamp.fromMillis(now.getTime() + index),
    createdBy: "system",
  });
});

await batch.commit();

console.log(`  ${existing.exists ? "replace" : "create "} ${TEST_ID} — ${paper.title}`);
console.log(`          ${QUESTIONS.length} questions · ${paper.totalMarks} marks · ${paper.durationMinutes} min · −${NEGATIVE} per wrong`);
console.log(`          course ${courseId}, public, published, listed until ${paper.closesAt}`);
console.log("\nOpen /pyq-test, register, sit it, and the analysis opens on submit.");
console.log("Remove it with `npm run seed:pyq-test -- --remove`.");
