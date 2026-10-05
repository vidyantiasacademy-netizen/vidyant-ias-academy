# Security

## Three layers, all required

| Layer | File | Covers | Blind spot |
| --- | --- | --- | --- |
| Proxy | `src/proxy.ts` | Signed-out visitors clicking portal links | Does not verify the cookie; does not know the role |
| Server | `src/lib/auth/server.ts`, `src/services/*` | Pages, Server Actions, Route Handlers — including direct `POST`s | Does not cover the browser talking to Firebase directly |
| Rules | `firestore.rules` | A user with their own Firebase token | Cannot run queries; cannot withhold a single field |

The Admin SDK **bypasses Security Rules entirely**. Every function in
`src/services` therefore authorises itself first — the rules are not a safety net
for that path.

## The one rule about students and scores

A student must never be able to compute or write their own score. Everything
below follows from it:

- `questions` is unreadable by students, at any time, including during a test.
  Firestore cannot withhold `correctOptionIds` on a read, so the server serves a
  redacted `QuestionForAttempt` projection instead.
- `answers` is server-written. A student's selection reaches Firestore only
  through `testService.saveAnswer`, which checks the attempt, its session token
  and the deadline first; `isCorrect` / `marksAwarded` / `evaluatedBy` can only be
  written by faculty, and only those fields.
- `testAttempts` is server-written too, including starting and submitting. Rules
  cannot count a violation or recognise a second window, so the collection is
  closed to clients rather than policed field by field. See **Examinations**.
- `results` is `allow write: if false` for everyone.
- `expiresAt` is computed from the server clock, never accepted from the client.

## Examinations

A second rule, for the MCQ runner: **nothing the browser says about time, or about
which window is writing, is believed.**

| Mechanism | Where | What it stops |
| --- | --- | --- |
| Redacted paper | `getQuestionsForAttempt` / `openExam` | The key is never in the page, so reading the DOM or the network tab gains nothing |
| Server clock | `expiresAt`, `heartbeat()` | A frozen or edited client clock; the countdown on screen is a copy of a server number |
| Session token | `testAttempts.sessionToken` | Two windows on one paper. Every write carries it; the newest window wins and the old one is locked out |
| Per-attempt shuffle | `lib/exam/shuffle.ts` | "Q7 is option C" between two students — order is seeded per attempt, options per question |
| Violation budget | `recordProctorEvent` | Tab switching and fullscreen escapes; the paper submits itself when the budget is spent |
| Sweep route | `POST /api/exams/sweep` | Pulling the network cable to read the paper at leisure — the attempt is scored from what was saved by the deadline |
| Watermark | `QuestionPanel` | Anonymous photographs of the screen; the roll number is on every question |
| Client writes closed | `firestore.rules` | `testAttempts` and `answers` are server-written: a direct Firestore write could not be counted or timed |

Both the attempt and the answers used to be client-writable, with rules policing
the field names. That is no longer enough and the rules say so in place: rules
cannot check a session token, cannot apply the expiry grace, cannot verify that a
question belongs to the paper, and cannot decide that a third tab switch ends the
sitting. All four moved into `testService`, and the collections closed.

**What this does not do.** Browser invigilation is a deterrent and an evidence
trail, not proof of an honest sitting. It cannot see the room, a second device, or
a person beside the candidate, and a determined student can disable the client
half — which is why the consequences of a silent client (no heartbeat → swept and
scored) and of a tampered one (no key to find) are both acceptable. There is no
devtools heuristic on purpose: window-size and timing tricks fire on a docked
inspector, a zoomed page and a slow phone, and a false accusation on an exam costs
more than a missed one. A high-stakes paper still needs a centre.

`EXAM_SWEEP_SECRET` is load-bearing: until it is set and a scheduler is calling
the sweep route every couple of minutes, an abandoned attempt stays open for ever
and "the timer does not pause when you close the laptop" is not true. Setup:
[exam-sweep.md](exam-sweep.md).

## What students explicitly cannot do

| Attack | Blocked by |
| --- | --- |
| Change their own score | `results` closed to all client writes; `answers` evaluation fields faculty-only |
| Activate their own enrollment | `enrollments` closed to all client writes |
| Mark a payment captured | `payments` closed to all client writes; webhook requires a valid HMAC |
| Read the answer key | `questions` requires FACULTY |
| Read another student | `isSelf(uid)` on `students`, `results`, `answers`, `notifications`, `payments` |
| Edit a question or a course | `questions` / `courses` require FACULTY / ADMIN |
| Give themselves a role | `users` create is `if false`; updates exclude `role` and `isActive` |
| Grant themselves a course | `students` self-update excludes `activeEnrollmentIds` |
| Rewrite their own history | `activity` is create-only; update and delete are `if false` |
| Buy extra exam time | `expiresAt` is server-computed and never extended; writes are refused past it plus a 10-second grace |
| Sit one paper in two windows | `sessionToken` on the attempt; the evicted window is refused and the event logged |
| Clear their invigilation record | `proctorEvents` is `allow write: if false` and append-only; students cannot read it either |
| Answer a paper they are not sitting | `saveAnswer` checks the question's `testIds` against the attempt |
| See results early | `publishedAt <= request.time` on `results` reads |
| Delete an evaluated answer sheet | `storageService.remove()` is ADMIN-only; every upload is `overwrite: false` under a timestamped id |

## Rule mechanics worth knowing

**`atLeast(role)`** ranks the role from the custom claim. The ranking in
`firestore.rules` is a hand-maintained copy of the `ROLES` order in
`src/types/db/user.ts` — change one and change the other, or the hole is silent.

**`active()`** reads the `active` claim, mirrored from `users/{uid}.isActive`.
A deactivated account fails every check including reads of its own data, without
deleting anything.

**`isEnrolled(courseId)`** is a single `get()` on
`enrollments/{uid}_{courseId}`, which only works because that id is
deterministic. Rules cannot run queries, so without the predictable id there
would be no way to check enrollment in rules at all.

**`onlyChanges([...])`** uses
`request.resource.data.diff(resource.data).affectedKeys().hasOnly(...)` — the
field-level allowlist that does most of the real work above.

**The catch-all** `match /{document=**} { allow read, write: if false; }` means a
new collection is unreachable from the browser until a block is written for it.
Deliberate: a forgotten collection fails closed.

## Files

Files are in Cloudinary, uploaded with delivery type `authenticated`: neither
the original nor a derived version is reachable without a signature. Nothing is
public, and no URL is stored anywhere — Firestore holds a media reference, and
`storageService.getSignedUrl()` turns it into a URL that expires in ten minutes,
authorising the caller first.

The expiry is the point. A Firebase `getDownloadURL()` token **never expires**,
so one shared link to a ₹60,000 course's material was permanent leakage.

**This layer has no rules file.** `storage.rules` used to re-check every write
at the bucket; Cloudinary has no equivalent, so `assertCanRead()` and
`assertCanWrite()` in `src/services/storage/storage.service.ts` are the whole of
the access control. Review a change to either as a rules change.

Uploads come in two shapes. A profile photograph is posted to a Route Handler,
which is the only path where the server sees the bytes and can enforce a size.
A large file — an answer-sheet photograph — goes straight to Cloudinary under a
signature from `/api/uploads/signature` that covers one exact public id and a
format whitelist; there the byte cap is the browser check plus the account
ceiling, which is why anything stricter must not use that path.

See [cloudinary.md](cloudinary.md) for the prefix table.

## Webhooks

Three unauthenticated endpoints authorised by signature, plus one by shared
secret (`/api/exams/sweep`, header `x-exam-sweep-secret`, compared with
`timingSafeEqual`; it refuses outright when the variable is unset rather than
running unauthenticated).

| Route | Header | Verification |
| --- | --- | --- |
| `/api/payments/razorpay/webhook` | `x-razorpay-signature` | HMAC-SHA256 of the raw body with `RAZORPAY_WEBHOOK_SECRET` |
| `/api/webhooks/mux` | `mux-signature` | HMAC-SHA256 of `{timestamp}.{body}`, plus a 5-minute age check |
| `/api/revalidate/sanity` | `sanity-webhook-signature` | `parseBody()` against `SANITY_REVALIDATE_SECRET` |
| `/api/exams/sweep` | `x-exam-sweep-secret` | Constant-time match against `EXAM_SWEEP_SECRET` |

Two things these get right and are easy to get wrong:

1. **Read the body as text before parsing.** The HMAC covers the exact bytes
   sent; `JSON.stringify(await req.json())` re-serialises them and the signature
   never matches.
2. **Compare in constant time.** `===` on a signature leaks it one byte at a
   time through timing. `timingSafeEqual` is used throughout.

Idempotency: Razorpay retries, so `payments.processedEventIds[]` records every
applied event id. A retried `payment.captured` cannot grant a second enrollment.

## Payments

The browser is never believed about money.

- The amount comes from `courses/{courseId}.price` server-side. A client-supplied
  amount would be a ₹1 enrollment.
- `verifyPayment()` checks the checkout signature so the UI can show success
  immediately — but it does **not** grant access.
- The enrollment is granted by `handleWebhook()`, so a student whose laptop dies
  between paying and the callback is still enrolled.
- `payments` is unwritable from any client, by any role.

## Secrets

`NEXT_PUBLIC_*` is inlined into the browser bundle. Everything else is
server-only.

Public by design: the Firebase web config (it identifies the project; it
authorises nothing), the Sanity project id and dataset.

Secret: `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`,
`SANITY_API_READ_TOKEN`, `SANITY_REVALIDATE_SECRET`, `RAZORPAY_KEY_SECRET`,
`RAZORPAY_WEBHOOK_SECRET`, `MUX_TOKEN_SECRET`, `MUX_SIGNING_KEY_PRIVATE`,
`MUX_WEBHOOK_SECRET`.

Enforcement is structural: `src/lib/firebase/admin.ts`, `lib/auth/session.ts`,
`lib/auth/server.ts`, `lib/auth/guards.ts`, `lib/firebase/firestore.ts` and every
service start with `import "server-only"`. If a Client Component ever imports one
— directly or through a barrel — **the build fails** rather than shipping the
key. Do not remove those imports, and do not re-export those modules from
anything a Client Component touches.

`.gitignore` covers `.env*`. A service-account JSON must never be committed;
copy the three values out of it and delete the file.

## Error handling

Vendor errors never reach a user. `AppError` in `src/lib/errors.ts` carries a
stable code (`AUTH_REQUIRED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`,
`CONFLICT`, `RATE_LIMITED`, `PAYMENT_FAILED`, `CONFIG_ERROR`, `INTERNAL_ERROR`),
an HTTP status and a safe message. `toJSON()` is the only shape that crosses the
network — causes are logged server-side and never serialised.

`auth/user-not-found` and `auth/wrong-password` deliberately collapse into one
message: distinguishing them tells an attacker which half of a credential pair
was right.

## Validation

Zod, at every boundary, because Firestore is schemaless and will happily store
`score: "99999"`.

| Boundary | Schema |
| --- | --- |
| Public forms | `src/lib/validation/schemas.ts` (pre-existing) |
| Auth forms, session route | `src/lib/validation/auth.ts` |
| Firestore writes, Server Actions | `src/lib/validation/entities.ts` |

Two checks there that are not obvious: `redirectTargetSchema` rejects anything
not starting with a single `/`, so `?next=https://evil.example` cannot turn the
login page into an open redirect; and `notifySchema.href` rejects absolute URLs,
because a link in a notification is a phishing vector.

## Pre-existing protections kept intact

The lead pipeline's IP rate limiter (5 per 10 minutes), honeypot field and
server-side re-validation all still run. The Firestore sink was added **after**
all three, so none of them was weakened.

## Review checklist

Before shipping anything that touches data:

- [ ] Does the service authorise before it reads? (`requireAuth` / `requireRole` / `requireSelfOrRole`)
- [ ] Is the Server Action wrapped in `action(guard, schema, handler)`?
- [ ] Does a new collection have a block in `firestore.rules`? (the catch-all denies it otherwise)
- [ ] Does a new query have an index in `firestore.indexes.json`?
- [ ] Is a new large text field excluded in `fieldOverrides`?
- [ ] Does any new file that touches the Admin SDK start with `import "server-only"`?
- [ ] Is the uid in a Server Action argument checked against the session?
- [ ] Does the webhook read `request.text()` before parsing?
- [ ] `npm run lint && npm run build && npx tsc --noEmit`
