# Firebase

The application backend: Auth, Firestore, and later Cloud Functions, Cloud
Messaging and Analytics.

Files are **not** here. Every upload goes to Cloudinary — see
[cloudinary.md](cloudinary.md). Firebase Storage is not enabled, needs no
billing plan, and has no rules file in this repo.

## 1. Create the project

1. [console.firebase.google.com](https://console.firebase.google.com) → **Add project**.
   Name it `vidyantias` (and `vidyantias-dev` for a staging project — do not
   develop against production data).
2. Enable Google Analytics only if you intend to use Firebase Analytics; it can
   be added later.

## 2. Enable the services

**Authentication** → Get started → Sign-in method:

- **Email/Password** — enable.
- **Google** — leave off. The app rejects it server-side; see
  [`authentication.md`](./authentication.md#why-there-is-no-google-sign-in).
- **Phone** — leave off until the OTP flow is built.

Under **Settings → Authorised domains**, add `localhost`, the Vercel preview
domain and `www.vidyantias.com`.

**Firestore Database** → Create database:

- **Production mode** (locked). The rules in this repo replace the default.
- Location `asia-south1` (Mumbai) — the users are in India, and location cannot
  be changed afterwards.

> **Storage** needs nothing. Do not press "Get started" under Build → Storage:
> it would create a bucket the app never writes to, and it is the one Firebase
> service that forces the Blaze plan. File storage is Cloudinary's job.

## 3. Register the web app

Project settings → General → Your apps → **Web**. Copy the config values into
`.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=vidyantias.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=vidyantias
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

These are public. A Firebase web config identifies the project; it authorises
nothing. Access control is Security Rules plus the Admin SDK — never the secrecy
of these values.

## 4. Server credentials

The Admin SDK bypasses Security Rules entirely, so its credentials are the
crown jewels. Two ways to provide them, preferred first.

### Application Default Credentials (preferred)

No secret in any environment variable, nothing to rotate.

- **Cloud Run / App Engine / Cloud Functions**: attach a service account to the
  service and set nothing. `resolveCredential()` picks it up via `GCP_PROJECT`.
- **Locally**: `gcloud auth application-default login`, then set
  `GOOGLE_APPLICATION_CREDENTIALS` to the path it prints.

### Explicit service account

For hosts that cannot carry a Google identity (Vercel, Netlify).

1. Project settings → **Service accounts** → Generate new private key.
2. Copy three values from the downloaded JSON into the host's environment:

```bash
FIREBASE_PROJECT_ID=vidyantias
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@vidyantias.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"
```

3. **Delete the JSON file.** Do not commit it, do not leave it in Downloads.

`FIREBASE_PRIVATE_KEY` is PEM text. Keep the `\n` escapes exactly as the JSON
has them — `admin.ts` converts them back to newlines. A key pasted with real
line breaks into a single-line env var is the most common setup failure.

## 5. Deploy rules and indexes

Install the CLI once: `npm i -g firebase-tools`, then `firebase login`.

```bash
firebase use --add                     # select the project, alias it "default"
npm run firebase:deploy:firestore      # rules + indexes
```

Until `firebase:deploy:firestore` has run, the live ruleset is the default
full-lock one Firebase creates with the database — every client read is denied,
and none of the role checks in `firestore.rules` are in effect. Verify which
ruleset is live with:

```bash
firebase firestore:rules get    # or check the Rules tab's "Last published"
```

`firebase.json` already points at `firestore.rules` and
`firestore.indexes.json`. Index builds take a few minutes on a populated database;
queries fail with `FAILED_PRECONDITION` until they finish.

> `firebase use --add` writes `.firebaserc`, which names the project. Commit it
> if the whole team deploys to the same project; otherwise keep it local.

## 6. Bootstrap the first admin

Everyone who signs in becomes a `STUDENT` — including you. Promoting the first
admin cannot be done through the app, because no admin exists to do it.

```bash
# One-off, with ADC or the service account in the environment:
node --input-type=module -e '
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const app = initializeApp({ credential: applicationDefault() });
const uid = process.argv[1];

await getAuth(app).setCustomUserClaims(uid, { role: "SUPER_ADMIN", active: true });
await getFirestore(app).doc(`users/${uid}`).update({ role: "SUPER_ADMIN" });
await getAuth(app).revokeRefreshTokens(uid);
console.log("promoted", uid);
' <THE_UID>
```

Both writes are required: the Firestore document is the source of truth, the
custom claim is what the Security Rules and the session cookie read. Revoking
refresh tokens forces the new claim to take effect immediately instead of up to
an hour later.

## 7. Local development with emulators

Recommended — it keeps test attempts and fake payments out of production, and
makes rules changes testable. Needs Java 21+ (`brew install openjdk@21`; the
launcher uses it for the emulators only and leaves your default `java` alone).

```bash
npm run firebase:emulators   # terminal 1 — Auth, Firestore and the UI
npm run emulator:seed        # terminal 2 — test logins (safe to re-run)
npm run dev:emulator         # terminal 2 — the app, pointed at the emulators
```

| Emulator | Port | UI |
| --- | --- | --- |
| Auth | 9099 | http://127.0.0.1:4000/auth |
| Firestore | 8080 | http://127.0.0.1:4000/firestore |

Seeded logins (password `test1234`):

| Email | Role |
| --- | --- |
| `admin@vidyant.test` | SUPER_ADMIN |
| `student@vidyant.test` | STUDENT, mobile 9999999999, roll VID-TEST-0001 |

`dev:emulator` sets `FIRESTORE_EMULATOR_HOST` / `FIREBASE_AUTH_EMULATOR_HOST`
for the Admin SDK and `NEXT_PUBLIC_FIREBASE_USE_EMULATORS=true` for the browser
SDK (`src/lib/firebase/client.ts`). A plain `npm run dev` still talks to the real
project. Emulator data is not persisted: stopping the emulators wipes it, so
re-run the seed after a restart. Only one `next dev` may run per folder, so stop
the normal dev server first.

Cloudinary has no emulator. Use a separate Cloudinary product environment for
development instead — see [cloudinary.md](cloudinary.md).

## Where the code lives

| File | Role |
| --- | --- |
| `src/lib/firebase/config.ts` | Validates the public config; `isFirebaseConfigured()` |
| `src/lib/firebase/client.ts` | Lazy client SDK accessors, for the browser |
| `src/lib/firebase/admin.ts` | `server-only` Admin SDK; credential resolution |
| `src/lib/firebase/collections.ts` | Collection names and deterministic document ids |
| `src/lib/firebase/firestore.ts` | Timestamp conversion, audit stamps, pagination |
| `src/lib/firebase/errors.ts` | Firebase error codes → `AppError` |

Everything initialises lazily, so the public website still builds and serves
with no Firebase project configured at all. Only sign-in and the portals become
unavailable.

## Not yet wired up

**Cloud Functions** — for work that must not depend on a request: computing
ranks when a batch finishes a test, expiring enrollments nightly, fanning out
FCM pushes, exporting to BigQuery. Add a `functions/` directory with its own
`package.json` and `firebase deploy --only functions`.

**Cloud Messaging** — needs a service worker at `public/firebase-messaging-sw.js`
and a VAPID key. Token storage belongs on `users/{uid}`.

**Analytics** — browser-only and needs a support check. Wire it behind the
existing `track()` facade in `src/lib/analytics`, not alongside it, so there
stays one call site per event.
