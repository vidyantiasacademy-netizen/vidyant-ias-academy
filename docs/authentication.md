# Authentication

Firebase Auth issues the identity. An httpOnly session cookie carries it to the
server. Custom claims carry the role to the Security Rules.

## The flow

```
browser                          server                        Firebase
───────                          ──────                        ────────
signInWithEmail()
  └─ firebase/auth ───────────────────────────────────────────▶ verify
                                                                  │
     ID token ◀────────────────────────────────────────────────────┘
       │
       └─ POST /api/auth/session { idToken }
                                   │
                                   ├─ verifyIdToken (reject if > 5 min old)
                                   ├─ createSessionCookie (5 days)
                                   ├─ Set-Cookie: vid_session (httpOnly)
                                   └─ ensureUserDocuments(uid)
                                        └─ users/{uid} + students/{uid}
                                           + custom claims { role, active }
       ◀── { uid, role, redirectTo }
```

From then on every request carries `vid_session`, and
`getSession()` in `src/lib/auth/session.ts` turns it into a `SessionUser`.

## Why a session cookie

An ID token lives in browser memory, so Server Components, Server Actions, Route
Handlers and the proxy cannot see it — which would make every authenticated page
client-rendered and every authorisation check client-side. The cookie is what
makes server-side rendering of private data possible.

It also makes sign-out real: `destroySession({ revokeAll: true })` clears the
cookie *and* revokes refresh tokens, so the session is dead server-side. An
in-memory token cannot be revoked.

Two details worth knowing:

- **Five-minute freshness window.** `createSession` rejects an ID token whose
  `auth_time` is older than five minutes, so a token captured from a log cannot
  be replayed into a fresh five-day session hours later.
- **`sameSite: "lax"`, not `"strict"`.** `strict` drops the cookie on the first
  navigation back from Razorpay Checkout, logging the student out mid-payment.

## Roles

```
STUDENT  <  MENTOR  <  FACULTY  <  COUNSELLOR  <  ADMIN  <  SUPER_ADMIN
```

Rank comes from the declaration order of `ROLES` in `src/types/db/user.ts`.
Appending is safe; inserting in the middle silently changes who can do what, and
`firestore.rules` has its own copy of the ranking that must be updated too.

A role is stored in **two** places:

| Where | Purpose |
| --- | --- |
| `users/{uid}.role` | Source of truth |
| Firebase Auth custom claim `role` | Readable by Security Rules and the session cookie with no document read |

`userService.setRole()` is the only writer, and it writes both plus
`revokeRefreshTokens()`. The revocation matters: claims are baked into an ID
token for up to an hour, so a demotion without it leaves the old privileges live
for that long.

Everyone starts as `STUDENT` — including the first admin. See
[`firebase.md` §6](./firebase.md) for the one-off bootstrap.

## The server API

From `src/lib/auth/server.ts`:

```ts
getCurrentUser()                        // SessionUser | null — never redirects
requireAuth()                           // SessionUser, or throws AUTH_REQUIRED
requireAuthPage("/dashboard")           // SessionUser, or redirects to /login
requireRole("FACULTY")                  // minimum rank; admits ADMIN, SUPER_ADMIN
requireAnyRole(["MENTOR", "FACULTY"])   // an explicit set, not a range
requireSelfOrRole(uid, "ADMIN")         // the subject, or staff acting on them
getCurrentUserProfile()                 // users/{uid}, memoised per render
getCurrentStudent()                     // students/{uid}, memoised per render
```

`requireAuth` throws; `requireAuthPage` redirects. Use the first in actions and
route handlers, the second in pages and layouts — a throw in a page renders an
error screen instead of sending the visitor to log in.

`requireSelfOrRole` is the one that is easy to forget and expensive to omit:
without it, swapping a uid in a Server Action argument reads someone else's
record.

### Server Actions

Reachable by a direct `POST`, so "the page already checked" is not a check.
`action()` from `src/lib/auth/guards.ts` makes the check part of the signature:

```ts
"use server";

import { action, roleGuard } from "@/lib/auth/guards";
import { courseSchema } from "@/lib/validation/entities";
import { courseService } from "@/services/courses/course.service";

export const createCourse = action(
  roleGuard("ADMIN"),
  courseSchema,
  async (input, user) => courseService.create({ ...input, stats: { lessonCount: 0, testCount: 0, enrolledCount: 0 } }),
);
```

It authorises, validates with Zod, and converts any throw into
`{ ok: false, error: "FORBIDDEN", message }` — no stack trace reaches the client.

## The client API

From `src/lib/auth/client.ts` (all `"use client"`):

```ts
signInWithEmail(email, password)
signUpWithEmail({ email, password, fullName })
sendPasswordReset(email)
signOut()
```

Components call these, never `firebase/auth` directly, because every sign-in has
a mandatory second half: posting the ID token to `/api/auth/session`. A component
that called `signInWithEmailAndPassword` itself would appear signed in while
every Server Component still saw an anonymous visitor. If the cookie exchange
fails, these functions sign the client back out so the two never disagree.

`AuthProvider` + `useAuth()` give client components the current user and role for
**presentation only** — showing an avatar, disabling a button. Mount it inside
the portal layouts (it already is), not the root layout, so marketing pages stay
static and never load the Firebase Auth chunk.

## Providers

| Provider | Code | Firebase console |
| --- | --- | --- |
| Email/password | Implemented | Enabled |
| Phone / OTP | Prepared, not implemented | Off |

Phone auth needs a reCAPTCHA verifier and a two-step OTP exchange. It slots into
`client.ts` as `signInWithPhone()` returning a confirmation handle; nothing
outside that module changes.

### Why there is no Google sign-in

Removed on purpose. A federated provider creates a Firebase user for anyone who
has an account there, and this centre provisions accounts itself. Two layers
keep it out:

- The sign-in form only offers email/password.
- `createSession` rejects any ID token whose `firebase.sign_in_provider` is not
  `password`, so calling the client SDK or REST API directly gets no session.

Also leave the **Google** provider disabled in the Firebase console, and under
**Authentication → Settings → User actions** untick **Enable create (sign-up)**,
so new accounts can only be created from the console or the Admin SDK.

## Route protection

| Route | Guard |
| --- | --- |
| `/dashboard/*` | `(student)/layout.tsx` → `requireAuthPage()`, then redirects staff to `/admin` |
| `/admin/*` | `(admin)/layout.tsx` → `requireAuthPage()` + `isAtLeast("COUNSELLOR")` |
| `/studio` | Sanity's own login, not Firebase |
| everything else | public |

`src/proxy.ts` additionally redirects portal URLs to `/login` when no cookie is
present. That is a UX optimisation, not security — it never verifies the cookie,
because it runs on every request including prefetches, and verification is a
Firebase round trip.

## Known gap

`/login` is still the placeholder page from the marketing site. The sign-in form
that calls `signInWithEmail()` is the next thing to build — it is the one piece
missing between this architecture and a working portal. See
[the next step](../README.md#next-step).
