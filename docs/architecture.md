# Architecture

Next.js is the application. Firebase is the backend. Sanity is the CMS.
Cloudinary holds the files. Nothing else.

```
                          Next.js 16 (App Router)
                                   │
   ┌─────────────┬──────────┴──┬─────────────┬──────────────────────┐
   │             │             │             │                      │
(marketing)  (student)      (exam)        (admin)                 api/
public pages /dashboard     /exam         /admin           route handlers
   │             │             │             │                      │
   │             └─────────────┴──────┬──────┘                      │
   │                               │                                │
   │                        src/services/*                          │
   │                   (authorise → read/write)                     │
   │                               │                                │
   ▼                               ▼                                ▼
Sanity CDN                 Firebase Admin SDK           Cloudinary · Razorpay
(GROQ, cached)             Auth · Firestore                   Mux · webhooks
```

## The split

| Concern | Lives in | Why |
| --- | --- | --- |
| Marketing copy, blog, current affairs, faculty bios, FAQs | **Sanity** | Non-technical editors publish daily; versioning and previews come free. |
| Students, enrollments, tests, attempts, results, payments, notifications | **Firestore** | Transactional, access-controlled, queried per user. |
| Lecture video | **Mux** (ids in Firestore) | Signed playback; Firestore holds the reference, never a playable URL. |
| PDFs, answer sheets, profile photos | **Cloudinary** | `authenticated` assets; served through signed URLs that expire in minutes. |
| Fees | **Razorpay** (records in Firestore) | Server-verified; the browser is never believed. |

Sanity is **not** the application database. The moment a document decides whether
someone has paid, who may read a lesson, or what a student scored, it belongs in
Firestore — a CMS has no per-user authorisation and its dataset is world-readable
by default.

## Request paths

There are three, and which one a feature uses determines how it is secured.

**1. Public page → Sanity.** A Server Component calls a function in
`src/lib/sanity/queries.ts`. Cached by tag, revalidated by the publish webhook
at `/api/revalidate/sanity`. No session involved; nothing private is reachable.

**2. Portal page → service → Admin SDK.** A Server Component in `(student)` or
`(admin)` calls a service in `src/services`. The service authorises with
`requireAuth()` / `requireRole()` and then reads Firestore with the Admin SDK,
which bypasses Security Rules. **The service's own check is the only thing
protecting that data**, which is why the check lives inside the service rather
than in the page that calls it.

**3. Browser → Firestore directly.** Only for real-time listeners, using the
client SDK. Here `firestore.rules` is the only protection, so it is written to
assume a hostile client.

A large file upload also leaves the browser directly, but for Cloudinary, under
a per-file signature minted by `/api/uploads/signature`. There is no rules layer
behind it: what that route authorises is what happens.

## Three layers of authorisation

| Layer | File | Protects against | Not sufficient because |
| --- | --- | --- | --- |
| Proxy | `src/proxy.ts` | A signed-out visitor seeing a portal shell | It only checks that a cookie *exists* — no verification, no role |
| Server | `src/lib/auth/server.ts` | Forged Server Action calls, direct `POST`s | Does not cover direct client SDK access |
| Rules | `firestore.rules` | A user talking to Firebase with their own token | Cannot do the lookups the server can; cannot hide a field |

All three. Removing any one of them opens a hole the other two do not cover.

## Directory map

```
src/
├── app/
│   ├── layout.tsx              document shell only
│   ├── (marketing)/            the public website — layout.tsx holds the chrome
│   ├── (student)/              /dashboard, auth-guarded in its layout
│   ├── (exam)/                 /exam/[testId] — the invigilated MCQ runner,
│   │                           deliberately without portal chrome: every link
│   │                           out of a live paper is a lost attempt
│   ├── (admin)/                /admin, role-guarded in its layout
│   ├── studio/[[...tool]]/     Sanity Studio
│   └── api/
│       ├── leads/              public form intake (pre-existing)
│       ├── auth/session/       ID token → session cookie
│       ├── payments/razorpay/webhook/
│       ├── webhooks/mux/
│       ├── exams/sweep/        scheduled: submits and scores sittings whose
│       │                       time is up and whose browser never came back
│       └── revalidate/sanity/
├── components/
│   ├── layout/SiteChrome.tsx   marketing header/footer/CTAs
│   └── portal/PortalShell.tsx  portal header
├── lib/
│   ├── auth/                   session, roles, guards, client helpers, provider
│   ├── firebase/               client SDK, Admin SDK, Firestore helpers, paths
│   ├── sanity/                 client, GROQ queries, image builder, types
│   ├── exam/                   invigilation policy, per-attempt shuffle, the
│   │                           runner's Server Actions and its client contract
│   ├── leads/                  lead pipeline + Firestore sink
│   ├── validation/             Zod schemas (forms, auth, entity writes)
│   └── errors.ts               AppError + error codes
├── services/                   the only place Firestore is read or written
├── types/
│   ├── index.ts                public-site content model (pre-existing)
│   └── db/                     Firestore domain model
└── proxy.ts                    optimistic route protection
```

`src/types/index.ts` and `src/types/db/` both define a `Course`. They are
different things — one is marketing copy, one is a priced, access-controlled
record — and they are deliberately never merged into one barrel.

## Designed for migration

Firebase was chosen for speed, not permanence. Three decisions keep the exit open:

- **Services, not scattered queries.** Components call
  `studentService.getById()`. Swapping Firestore for Postgres is a rewrite of
  `src/services`, not of the application.
- **Flat collections with id references.** `enrollments` is a top-level
  collection with `studentUid` and `courseId`, not a subcollection. That is a
  join table.
- **ISO strings, not vendor types.** `lib/firebase/firestore.ts` converts every
  `Timestamp` to an ISO string on read, so entities are already
  `timestamptz`-shaped.

## Deliberately absent

No NestJS, no separate API server, no Redis, no message queue, no microservices.
Route Handlers and Server Actions are the backend; Cloud Functions handle the
scheduled and triggered work. Add infrastructure when a measured problem demands
it.

## Further reading

- [`firebase.md`](./firebase.md) — project setup, credentials, emulators
- [`sanity.md`](./sanity.md) — CMS setup, schemas, webhooks
- [`authentication.md`](./authentication.md) — sign-in, sessions, roles
- [`firestore-schema.md`](./firestore-schema.md) — collections and relationships
- [`security.md`](./security.md) — the rules and the authorisation model
