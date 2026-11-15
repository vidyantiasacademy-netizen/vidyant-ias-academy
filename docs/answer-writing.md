# Mains answer writing

Faculty upload a Mains paper as a PDF — the questions with answer space under
each. A student downloads it, writes on it (a printout, or a stylus app on a
tablet), and uploads the pages. Faculty mark the copy and return it with marks
per question, a rubric, written feedback, and the checked copy itself — the
student's pages with the evaluator's marks and comments on them.

| | Student portal | Admin portal (FACULTY and above) |
| --- | --- | --- |
| List | `/dashboard/mains` — papers by urgency, plus a writing profile across returned copies | `/admin/answer-writing` — copies waiting for evaluation (oldest first) and every paper |
| One paper | `/dashboard/mains/[testId]` — get the paper, write, upload, submit; the evaluation once released | `/admin/answer-writing/[testId]` — PDF, marking scheme, publish, copies, release, batch analysis |
| Other | `/dashboard/mains/[testId]/file/[file]` — redirect to a fresh signed URL (`paper`, `1`…`n`, `checked-copy`) | `/new`, `/[testId]/edit`, `/[testId]/copies/[studentUid]` — the evaluation screen |

## How it fits the existing model

- **The paper is a `tests` document** of kind `mains-descriptive`, so course
  binding, enrollment gating, publish status and the opening/closing window all
  work as they do for MCQ papers. Two fields are Mains-only:
  `questionPaperPath` (the PDF) and `markingScheme` (label, max marks and word
  limit per question). `questionCount` and `totalMarks` are derived from the
  scheme, so they cannot disagree with it.
- **A copy is `answerSubmissions/{testId}_{studentUid}`** — one per student per
  paper, a deterministic id so a retried upload lands on the same document.
- **An evaluated copy writes `results/{submissionId}`.** A Mains score is then an
  ordinary scorecard: held by the same `publishedAt` gate, released and ranked by
  the same `testService.releaseResults`, and counted on the Performance board
  (accuracy stays empty — right and wrong are MCQ ideas).

The MCQ runner's routes redirect Mains papers here, and Admin → Tests lists MCQ
papers only.

## The life of a copy

```
draft ──submit──▶ submitted ──claim / first save──▶ in-review ──complete──▶ evaluated
  ▲                   │
  └────withdraw───────┘   (until an evaluator starts, and before the deadline)
```

- **draft** — created when the student first opens the question paper inside its
  window (the time is kept: evaluators see "submitted 2 h 51 min after first
  opening the paper") or uploads a first page. Pages can be added, removed and
  reordered.
- **submitted** — needs at least one page and an open window. The student can
  withdraw it to change pages until an evaluator starts.
- **in-review** — an evaluator's first save claims the copy. Opening the screen
  claims nothing, so browsing does not lock others out. A copy held by someone
  else shows who, with **Take over**.
- **evaluated** — complete. Needs marks (or "not attempted") for every question,
  all five rubric scores, and overall remarks. Corrections are saved directly and
  keep the result's release date and rank; **Refresh ranks** on the paper page
  re-ranks after a correction.

Every transition is a Firestore transaction: a student withdrawing at the moment
an evaluator opens the copy must end with exactly one of them winning.

## When a student sees their evaluation

The paper's **Evaluations visible from** (`resultsVisibleFrom`):

- blank — each copy is returned the moment it is evaluated, and the student is
  notified;
- a date — copies are held until then. **Release and rank** on the paper page
  releases every evaluated copy at once, ranks them, and notifies each student.

Until release the student sees only "evaluated — results on {date}". The draft
evaluation, the marks and the checked copy are unreachable: students cannot read
`answerSubmissions` at all, and the checked copy is stored under `tests/`, not
their own folder.

## Files and access

All files are Cloudinary `authenticated` assets (see `docs/cloudinary.md`).

| File | Public id | Written by | Read by |
| --- | --- | --- | --- |
| Question paper | `tests/{testId}/paper/{name}` | Faculty | Faculty; enrolled students once the paper opens, via `getQuestionPaperUrlForStudent` |
| Answer pages | `students/{uid}/answers/{testId}_{uid}/{name}` | The student | The student; faculty |
| Checked copy | `tests/{testId}/evaluated/{uid}/{name}` | Faculty | Faculty; the student after release, via `getEvaluatedCopyUrlForStudent` |

Uploads go straight from the browser to Cloudinary under a per-file signature,
then the reference is registered with a Server Action. The reference is only a
claim, so the server checks it sits in *this* copy's folder, in an accepted
format (`isMediaRefIn`), before storing it.

Performance choices worth knowing:

- Photos are re-encoded on the device to 2200 px / JPEG 0.82 before upload
  (`compressForUpload`) — a 6 MB phone photo becomes well under 1 MB and stays
  legible. PDFs are untouched.
- Pages upload one at a time: no faster in parallel on a phone connection, and a
  dropped connection leaves every finished page in place, in order.
- The evaluator's screen signs every page once per render (a local HMAC, 60-minute
  TTL). Student downloads go through a redirect route instead, so a link on a
  page left open through a three-hour paper still works.
- The student board reads copies by their deterministic ids in one `getAll` — no
  query, no index.

## The sample paper

`scripts/answer-writing/sample-paper.mjs` holds a five-question GS Paper II
practice paper (60 marks, 45 minutes) — the questions, the marking scheme, and
the PDF builder, in one place so the PDF and the scheme cannot drift.

```bash
npm run answer-writing:sample-pdf   # writes docs/samples/answer-writing-sample-paper-01.pdf
npm run seed:answer-writing         # uploads it and publishes it to the Mains Program course
npm run seed:answer-writing -- --course=test-series --days=14
npm run seed:answer-writing -- --dry-run
```

The seeder is idempotent (fixed id `answer-writing-sample-01`), writes to the
emulator when `FIRESTORE_EMULATOR_HOST` is set, and refuses `--force` once any
student has a copy. Any student with an active enrollment in the course sees it.

## Deploying

New composite indexes and rules ship with the feature:

```bash
npm run firebase:deploy:firestore
```

- `answerSubmissions (status, submittedAt)` — the evaluation queue.
- `tests (kind, createdAt)` — the Mains paper list.
- Index exemptions on `answerSubmissions.evaluation` and `.files`.

Until the indexes build, the admin queue and paper list fail with
`FAILED_PRECONDITION`.

## Not built yet

- In-browser annotation. Evaluators annotate in their own PDF or stylus app and
  upload the result; an on-screen pen over the pages is the natural next step.
- Mobile API endpoints. The app tells students to use the web portal for Mains
  papers.
- Assigning copies to evaluators. Today any faculty member can pick up any copy
  from the shared queue.
