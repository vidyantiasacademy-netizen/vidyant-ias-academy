# Firestore schema

Nineteen flat, top-level collections. Types in `src/types/db/`, names in
`src/lib/firebase/collections.ts`.

## Why flat

Subcollections (`students/{uid}/attempts/{id}`) look tidier and are the wrong
choice here. The queries the institute actually needs — "every enrollment for
this batch", "every attempt for this test", "the evaluation queue" — cut across
students, and each would need its own collection-group index. Flat collections
with id references answer them directly, and they are already join tables for
the eventual move to Postgres.

The other rule: **nothing unbounded inside a document.** A student document that
accumulated attempts, answers and notifications would pass Firestore's 1 MiB
limit inside a year and be re-read in full on every dashboard load.

## Relationships

```
users/{uid}                     ── the account, one per Firebase Auth user
   │
   ├── students/{uid}           ── learner profile (same uid; one read, no query)
   │      │
   │      ├── enrollments/{uid_courseId}  ── THE access grant
   │      │        └── courses/{courseId}
   │      │                 ├── batches/{batchId}
   │      │                 ├── lessons/{lessonId}
   │      │                 └── tests/{testId}
   │      │                          └── questions/{questionId}
   │      │
   │      ├── testAttempts/{attemptId}
   │      │        ├── answers/{attemptId_questionId}
   │      │        ├── proctorEvents/{eventId}   ── invigilation log, staff-only
   │      │        └── results/{attemptId}
   │      │
   │      ├── doubts/{doubtId}
   │      ├── payments/{paymentId}
   │      ├── notifications/{notificationId}
   │      └── activity/{activityId}
   │
   └── faculty/{uid}            ── teaching staff (public bio lives in Sanity)

mentorship/{sessionId}          ── studentUid + mentorUid
enquiries/{enquiryId}           ── website leads, pre-account
```

## Deterministic ids

Where a natural key exists, the document id *is* that key, so a retried write
overwrites instead of duplicating. From `src/lib/firebase/collections.ts`:

| Collection | Id | Effect |
| --- | --- | --- |
| `users`, `students`, `faculty` | the Firebase Auth uid | A profile is one `get`, never a query |
| `enrollments` | `{studentUid}_{courseId}` | "Is this student enrolled?" is one document read, and the rules can do it |
| `answers` | `{attemptId}_{questionId}` | A flaky connection re-saving an answer cannot create two |
| `results` | `{attemptId}` | One attempt, one scorecard, structurally |

The `enrollments` id is the one doing the most work: `firestore.rules` cannot run
queries, so without a predictable id the rules could not check enrollment at all.

## Audit fields

Every document carries these, stamped by `auditOnCreate` / `auditOnUpdate`:

```ts
createdAt: IsoDateTime   // Firestore serverTimestamp — a client clock cannot fake it
updatedAt: IsoDateTime
createdBy: Uid | "system"
updatedBy: Uid | "system"
```

`"system"` means a webhook or Cloud Function, with no session.

Timestamps are written as Firestore `Timestamp` and read back as ISO-8601
strings — `lib/firebase/firestore.ts` converts them, recursively, including
inside arrays. That keeps entities serialisable across the Server → Client
Component boundary and makes a `timestamptz` column a straight mapping later.

Money is stored in **paise** (`amountInPaise`), never rupees as a float. ₹1,500
is `150000`.

## The collections

### `users/{uid}`
The account, for every role. `role` and `isActive` are mirrored into custom
claims; `userService.setRole()` is the only writer of either.

### `students/{uid}`
Biographical profile, preparation stage, assigned mentor,
`activeEnrollmentIds` (denormalised for the portal header; `enrollments` is
authoritative).

### `faculty/{uid}`
Operational record: `courseIds` they may author for, `sanitySlug` joining to the
public bio. Credentials and contracts stay out — they are files, in Cloudinary.

### `courses/{courseId}`
The sellable programme: `price` (nullable — many fees are quoted on a call),
`status`, `facultyUids`, and `stats` counters maintained server-side. Marketing
prose is in Sanity via `sanitySlug`.

### `batches/{batchId}`
A dated cohort of one course: `startDate`, `mode`, `seatLimit`, `seatsFilled`.

### `enrollments/{studentUid_courseId}`
**The access grant**, and the document every other access check consults.
`status` is the switch between "has paid" and "has not", so students cannot
write this collection at all — only `enrollmentService` behind a staff check,
and the Razorpay webhook.

### `lessons/{lessonId}`
One unit of teaching content. `muxAssetId` and `storagePath` are *references* —
a Mux asset id and a Cloudinary media reference — never playable URLs: a student
who reads this document still cannot fetch the media without a server-minted
signed token.

### `tests/{testId}`
The paper. `opensAt` / `closesAt` bound when an attempt may start;
`resultsVisibleFrom` seals the scorecard until the whole batch has sat it.
`security` is the per-paper `ExamSecurityPolicy` — fullscreen, shuffling, the
copy/paste block and the violation budget. `null` means the institute default in
`src/lib/exam/policy.ts`, never "unproctored": a paper created before the field
existed must not be the one that ships without invigilation.

### `questions/{questionId}`
The question bank and PYQ database. `testIds` is an array, so one bank serves
many papers. **No student may read this collection** — Firestore cannot withhold
`correctOptionIds` on a read, so the server serves a redacted
`QuestionForAttempt` projection during an attempt instead.

### `testAttempts/{attemptId}`
One sitting, and the one document the exam runner's invigilation hangs off.
**Closed to every client write**, including the student's own — starting,
answering, beating and submitting all go through Server Actions, because
Security Rules cannot count violations or check a session token.

- `expiresAt` is computed server-side from `startedAt + durationMinutes`, once.
  Resuming never extends it.
- `sessionToken` is the window that owns the sitting. Every answer, heartbeat and
  submit carries it; a mismatch is refused and logged as `secondWindow`.
- `shuffleSeed` reproduces this student's question and option order on every read
  without storing the permutation (`src/lib/exam/shuffle.ts`).
- `lastSeenAt` is the heartbeat. Stale plus past `expiresAt` is what the sweep
  route finalises.
- `focusLossCount`, `fullscreenExitCount`, `blockedActionCount`, `violationScore`
  are the budget the server reads before accepting the next write;
  `autoSubmitted` and `terminationReason` record who ended the paper.

### `answers/{attemptId_questionId}`
What the student selected or wrote. Written only by `testService.saveAnswer`,
which checks the session token, the deadline, that the question belongs to this
paper and that the chosen option exists on it. `isCorrect` / `marksAwarded` /
`evaluatedBy` are evaluator-written. `timeSpentSeconds` is the raw material for
weakness detection.

### `proctorEvents/{eventId}`
The invigilation log: one row per fullscreen exit, tab switch, refused copy,
second window or auto-submit, with the weight it cost. Append-only and
server-written — it is evidence, so nothing in the product updates or deletes a
row. Staff-readable only: a student who can see which of their attempts was
recorded can see which were not.

### `results/{attemptId}`
The scorecard: score, counts, negative marks, `rank`, `percentile`, and
`subjectBreakdown[]`. Nobody writes this from a client, ever.

### `mockAttempts/{attemptId}`
One website visitor's sitting of a free public mock test (a `tests` paper with
`audience: "public"`). Visitors have no account, so this is not `testAttempts`:
answers (`questionId → optionIds`), score and scorecard all live on this one
document — bounded by the paper's question count. `score` is top-level so a
rank is a single count query. `enquiryId` links the sitting to the lead its
registration created, and the result is written back onto that enquiry.
Ownership is a random token in an httpOnly cookie; only its SHA-256
(`accessTokenHash`) is stored. Closed to every client read and write — the
server reads it with the Admin SDK in `src/services/mock-tests`.

### `doubts/{doubtId}`
A student question routed to faculty or a mentor. Editable by the student while
`open`.

### `mentorship/{sessionId}`
Scheduled sessions, `sharedNotes` (student-visible) and `privateNotes`
(mentor-only). Students do not read this collection directly — Firestore cannot
hide one field, so the server returns a projection without `privateNotes`.

### `notifications/{notificationId}`
One document per recipient (fan-out on write). The alternative, one document
with a recipient array, cannot answer "my unread notifications, newest first"
without reading every notification in the system.

### `enquiries/{enquiryId}`
The CRM record behind the public forms. Written by the Firestore lead sink
(`src/lib/leads/firestore-sink.ts`) inside the existing `POST /api/leads`
request; read by counsellors. Closed to all client writes.

### `payments/{paymentId}`
One Razorpay order and its outcome, with `processedEventIds[]` making webhook
retries idempotent. `allow write: if false` for every role — a status here is
money.

### `activity/{activityId}`
Append-only learning events: `videoStarted`, `pdfOpened`, `questionAnswered`,
`testCompleted`, … Nothing reads them yet. They exist so the AI and analytics
phases start with real history instead of an empty table, and so the questions
worth asking — when did this student stop watching, which subject do they avoid
— are answerable at all.

## Indexes

`firestore.indexes.json` holds one composite index per query that exists in
`src/services`, each annotated with the query it serves. Firestore handles
single-field equality and ordering automatically; a combination needs an index or
the query fails with `FAILED_PRECONDITION`.

`fieldOverrides` **disables** indexing on large text fields (`questions.statement`,
`answers.text`, `doubts.question`, …). Those indexes are pure write cost, and an
indexed field over 1500 bytes fails the write outright — which a long Mains
answer will do.

Do not add speculative indexes: each one costs storage and slows writes to its
collection, and Firestore's error message contains a direct link to create the
one actually needed.

## Migration notes

Designed so the exit to Postgres/BigQuery stays cheap:

- Collections map to tables, id references to foreign keys.
- ISO strings map to `timestamptz`; `amountInPaise` to `bigint`.
- Nested arrays are the only thing needing a decision:
  `results.subjectBreakdown[]`, `enquiries.activity[]` and
  `mentorship.actionItems[]` each become a child table.
- `students.activeEnrollmentIds` is denormalised and would be dropped — it is
  derivable from `enrollments`.
