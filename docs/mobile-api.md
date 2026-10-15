# Mobile API (`/api/mobile/v1`)

The VidyantIAS student app (Expo, separate repository `VidyantIasMobile`) talks
to this server. It does not read Firestore directly: every route here is a thin
adapter over the services the web portal already uses, so enrollment, release
dates, invigilation and scoring have one implementation.

## Authentication

`Authorization: Bearer <Firebase ID token>`. `verifyBearer()` in
`src/lib/auth/session.ts` is consulted only when there is no session cookie, and
applies the same gates as `createSession`: verified signature with revocation
check, `password` provider only, `active !== false`. Every `requireAuth()` /
`requireSelfOrRole()` therefore works for app requests unchanged.

## Files

| Path | Purpose |
| --- | --- |
| `src/lib/mobile/contract.ts` | Response/request shapes. Self-contained; copied verbatim to the app |
| `src/lib/mobile/http.ts` | `mobileRoute()` wrapper: auth first, `AppError` → envelope, `no-store` |
| `src/lib/mobile/views.ts` | Composition over existing services |
| `src/lib/mobile/streak.ts` | Pure IST study-streak calculation |
| `src/lib/validation/mobile.ts` | Zod schemas for app request bodies |
| `src/app/api/mobile/v1/**/route.ts` | 27 route handlers |
| `src/services/progress/` | `lessonProgress` — resume position, completion |
| `src/services/bookmarks/` | `bookmarks` — saved lessons, articles, reviewed questions |
| `src/services/devices/` | `pushDevices` — Expo push tokens (registration only) |
| `src/services/account/` | Support and account-deletion requests → `enquiries` |

## New collections

`lessonProgress`, `bookmarks`, `pushDevices` — server-written only; rules blocks
and composite indexes added. Deploy with `npm run firebase:deploy:firestore`.

## Read straight from Sanity

**PYQ papers** (`pyqPaper`) have no route here. They are public UPSC papers, so
the app queries Sanity's CDN directly and a published paper appears with no
deploy or app update:

```groq
*[_type == "pyqPaper"] | order(year desc, stage asc, paper asc) {
  _id, year, stage, paper, pageCount, publishedAt,
  "url": file.asset->url, "size": file.asset->size,
  "answerKeyUrl": answerKey.asset->url, "answerKeySize": answerKey.asset->size
}
```

`size` is bytes from the asset, for "8.2 MB" before download. Editors should run
scans through `ocrmypdf --optimize 3` before uploading (10–30 MB → 1–3 MB, plus
a text layer). Paid material must not use this path — the dataset is
world-readable; use Storage + signed URLs like `getDocumentLink`.

Bulk import: `npm run seed:pyq:sanity -- <manifest.json>` (see
`scripts/seed-pyq-sanity.mjs`). Mains 2016–2019 (393 papers, all subjects) were
loaded this way from github.com/Shabber10/ALL-PYQ-Papers, OCR'd and optimised
first. Prelims papers and answer keys are not loaded yet.

## Not yet wired

- **Push delivery.** `pushDevices` holds Expo push tokens. Sending — from
  `notificationService.notify` or a Cloud Function, via
  `https://exp.host/--/api/v2/push/send` — is still to be built.
- **Live class schedule.** `LessonDoc` has no `scheduledAt`/`joinUrl`.
- **Practice outside papers.** `questions` has no practice-safe flag; serving
  it ad hoc could leak keys of unreleased papers.

Full endpoint table and status: `VidyantIasMobile/docs/backend-integration.md`.
