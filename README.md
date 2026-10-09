# vidyantIAS

UPSC coaching and mentorship institute, Pune. Next.js 16 (App Router) · TypeScript ·
Tailwind CSS v4 · Firebase (Auth, Firestore) · Cloudinary (files) · Sanity CMS.

The public website is live content; the student and admin portals are scaffolded
and auth-guarded but not yet built out. Architecture is documented in
[`docs/`](./docs/architecture.md).

## Commands

```bash
npm run dev     # local dev at http://localhost:3000
npm run build   # production build
npm run lint    # eslint
npx tsc --noEmit
```

## Environment

```bash
cp .env.example .env.local
```

`.env.example` documents every variable with where to find it. The public
website builds and serves with only `NEXT_PUBLIC_SITE_URL` set — Firebase,
Sanity, Razorpay and Mux are all read lazily, so an unconfigured integration
disables its feature instead of breaking the build.

| Group                                                    | Needed for                                                      |
| -------------------------------------------------------- | --------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                                   | Canonical URLs, sitemap, robots                                 |
| `NEXT_PUBLIC_FIREBASE_*`                                 | Sign-in and the portals ([setup](./docs/firebase.md))           |
| `FIREBASE_PROJECT_ID` / `_CLIENT_EMAIL` / `_PRIVATE_KEY` | Server-side Firestore — **secret**                              |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET`     | File storage ([setup](./docs/cloudinary.md)) — **secret**       |
| `NEXT_PUBLIC_SANITY_*`, `SANITY_*`                       | CMS content and the publish webhook ([setup](./docs/sanity.md)) |
| `RAZORPAY_*`                                             | Online fee payment — **secret**                                 |
| `MUX_*`                                                  | Signed lecture playback — **secret**                            |

## Pages

**Public** (`src/app/(marketing)/`) — `/` · `/about` · `/courses` + `/courses/[slug]` · `/faculty` + `/faculty/[slug]` · `/results` · `/testimonials` · `/resources` · `/current-affairs` + `/[slug]` · `/blog` + `/[slug]` · `/events` · `/enrol` · `/brochure` · `/demo` · `/counselling` · `/contact` · `/faq` · `/search` · `/login` (placeholder) · `/privacy-policy` · `/terms` · `/refund-policy` · `/sitemap.xml` · `/robots.txt` · `/opengraph-image`

**Portals** — `/dashboard` (`(student)/`, auth-guarded) · `/admin` (`(admin)/`, COUNSELLOR and above) · `/studio` (Sanity Studio, Sanity login)

**API** — `/api/leads` · `/api/auth/session` · `/api/payments/razorpay/webhook` · `/api/webhooks/mux` · `/api/revalidate/sanity`

Route groups are transparent in the URL: moving the public pages into
`(marketing)/` changed no paths. The root layout is now the document shell only,
and the header/footer/CTAs live in `components/layout/SiteChrome.tsx` so the
portals can render their own shell.

Content routes have `loading.tsx` skeletons; `(marketing)/error.tsx` and the
root `not-found.tsx` cover failures.

## Homepage

The section order answers the four questions a visitor arrives with — who are you, what do you offer, why trust you, what do I do next:

hero (standing notice strip, positioning headline, the rotating institute banner panel — campaign slides defined in `src/components/hero/promo-banners.ts` — programme pills, and the `HeroCallbackForm` admissions card on the right: three fields straight into the lead pipeline) → trust bar → noticeboard (announcements · articles · quizzes) → upcoming batches → programmes → why us → learning system → mentorship → performance tracking → faculty → results → testimonials → free resources → current affairs → orientation → events & webinars → student app → YouTube & social → FAQ → centre contact + callback → closing CTA.

Surfaces alternate `white` → `paper` (pale indigo) → `indigo` (full-colour band); keep that rhythm when inserting a section. Three bands per page is the ceiling — more and they stop being punctuation.

## Conversion paths

| Action                       | Where it lives                                                                                                                                                                                                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Enroll Now                   | `/enrol` — `EnrolmentForm`, header, hero, batch cards                                                                                                                                                                                                               |
| Book Free Counselling        | `/counselling`                                                                                                                                                                                                                                                      |
| Free demo class              | `/demo`                                                                                                                                                                                                                                                             |
| Download Brochure            | `/brochure` — `BrochureForm`; serves the file directly once `BROCHURE.href` is set                                                                                                                                                                                  |
| Request a Callback           | `HeroCallbackForm` in the hero (name, mobile, programme) and `CallbackForm` — homepage contact block, `/contact#callback`, `/enrol`. Both post `form: "callback"`; `callbackSchema` requires only name and phone, and each form tightens the rest with `.extend()`. |
| Enquiry form                 | `/contact#enquiry`                                                                                                                                                                                                                                                  |
| Free study material          | `/resources` — direct download or `ResourceRequestForm`                                                                                                                                                                                                             |
| Event / webinar registration | `/events`                                                                                                                                                                                                                                                           |
| WhatsApp + Call              | `StickyMobileCta` below `lg`, `FloatingActions` above it, plus header and footer                                                                                                                                                                                    |

Every one of them posts to `/api/leads` with its own Zod schema.

## Structure

```
src/
├── app/
│   ├── layout.tsx      document shell only
│   ├── (marketing)/    the public website
│   ├── (student)/      /dashboard
│   ├── (admin)/        /admin
│   ├── studio/         Sanity Studio
│   └── api/            route handlers and webhooks
├── components/         ui/ primitives + one folder per domain; layout/SiteChrome, portal/PortalShell
├── data/               typed content files (courses, faculty, faqs, resources, events…)
├── lib/
│   ├── analytics/      provider-agnostic event facade (window.dataLayer)
│   ├── auth/           session cookie, roles, guards, client helpers, AuthProvider
│   ├── constants/      brand, contact, navigation, image registry
│   ├── cloudinary/     media public ids, signed uploads, SDK config
│   ├── firebase/       client SDK, Admin SDK, Firestore helpers
│   ├── leads/          lead pipeline, rate limiter, Firestore sink
│   ├── sanity/         client, GROQ queries, image builder, types
│   ├── seo/            metadata builder + JSON-LD
│   ├── validation/     Zod schemas (forms, auth, entity writes)
│   └── errors.ts       AppError + stable error codes
├── services/           the only place Firestore is read or written
├── types/
│   ├── index.ts        public-site content model
│   └── db/             Firestore domain model
└── proxy.ts            optimistic route protection (Next 16's middleware)

sanity/                 CMS schemas + studio structure (config at sanity.config.ts)
docs/                   architecture, firebase, cloudinary, sanity, authentication, firestore-schema, security
firestore.rules · firestore.indexes.json · firebase.json
```

Content never lives in components. Swap a `data/*.ts` file for a CMS fetch and the UI is unchanged.

Components never contain a Firestore query either — they call a service, which
authorises first. See [`docs/architecture.md`](./docs/architecture.md).

## Logo

The mark is **Kalam — the Nib** (concept 01 of _VidyantIAS Logo Concepts_): a fountain-pen nib whose slit and breather hole together spell a hidden "i". It is drawn, not photographed — `components/ui/NibMark` renders it inline from the geometry in `src/lib/brand/nib.ts`, which is the only place the shape is defined.

The body uses `currentColor` and the slit is an `evenodd` cut-out, not a white shape, so one path serves every surface: indigo on white, white on indigo, black on a photocopy. The breather hole is the identity's single saffron element — it stands for the student. `mono` punches it out with the slit for one-colour printing and stamps.

`components/ui/Logo` composes that mark with the logotype (Source Serif 4, set from `BRAND.logotype`) and nothing else — the slogan is not part of the lockup. Props: `tone` (`dark` \| `light`), `size`, `asStatic`. The bar grows (`h-16 sm:h-20 lg:h-24`) and the mobile drawer's `top` offset tracks those heights.

Static assets are generated, never hand-edited — run `npm run brand:assets` after changing the geometry:

| File                                | Use                                               |
| ----------------------------------- | ------------------------------------------------- |
| `src/app/icon.svg`                  | favicon / tab icon — white nib on an indigo tile  |
| `src/app/apple-icon.png`            | 180px home-screen icon (iOS applies its own mask) |
| `public/images/logo-mark.svg`       | the bare mark, indigo on light surfaces           |
| `public/images/logo-mark-light.svg` | the bare mark reversed, used by the OG card       |

**Naming note:** the logo deck sets the name as **VidyantIAS**, while the site copy uses **vidyantIAS** throughout. `BRAND.logotype` carries the deck's casing for the drawn name and `BRAND.name` the running-copy casing; confirm which wins before launch and align the other — both live in `lib/constants/site.ts`.

## Design system

Tokens are defined once in `src/app/globals.css` under `@theme` — colours (`indigo`, `kesar`, `paper`, `ink`, `line`), the type scale (`text-hero`, `text-h2`, `text-body`…), radii and shadows. Components use token classes (`bg-indigo`, `text-ink-secondary`), never raw hex values.

The theme is **Ink Indigo & Kesar**, taken from the logo deck and tuned for the audience the institute actually serves — aspirants in small towns and villages, on budget Android phones, often outdoors and on a slow connection. The brand is **Ink Indigo `#1D2470`** plus **Kesar `#F39A1E`**, on white `#FFFFFF` and black `#111111`. There is no fifth colour.

Colour is used in **blocks, not as trim**: full-width indigo bands (the learning system, the orientation block, the closing CTA, the footer) alternate with white and `paper` sections, kesar fills the primary call to action, and the `kesar-100` wash sits behind highlights. Saffron stands for the student, so it appears once per element — an accent rationed to a hairline reads as beige on a cheap panel, and that is the mistake this palette exists to avoid.

That audience sets four rules the tokens already encode:

| Rule                                    | Token / value                                                                 |
| --------------------------------------- | ----------------------------------------------------------------------------- |
| Body text targets AAA, not AA           | `ink-secondary` 9.0:1 on white, `ink-muted` 9.7:1                             |
| Nothing below 13px; body is 17px        | `--text-body` 1.0625rem, `--text-small` 0.9375rem, `--text-eyebrow` 0.8125rem |
| Borders survive a cheap LCD in daylight | `--color-line` `#DDE2F2`, `--color-line-strong` `#C2CBE4`                     |
| Controls are thumb-sized                | Button heights `h-10 / h-12 / h-14`, every icon control 44px                  |

The phone number and WhatsApp link sit in the hero notice strip as well as the sticky bar, because a large part of this audience would rather call than fill a form. No hero photography or icon fonts — illustrations are inline SVG drawn from tokens, so the page is useful on 3G. Renaming the family means editing the token block and the class names together — they are kept in sync (`bg-indigo`, `tone="indigo"`). Dark mode is deliberately not implemented.

> `src/lib/utils/cn.ts` registers the custom font-size scale with `tailwind-merge`. Without it, `text-body` is mistaken for a colour utility and silently strips `text-white`.

## Placeholder content — replace before launch

Everything below is marked `TODO(institute)` or `TODO(content)` in code:

| What                                            | Where                                                                                                      |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Address, phone, WhatsApp, email, social handles | `src/lib/constants/site.ts`                                                                                |
| Faculty names, credentials, photographs         | Sanity `faculty` documents (sample role cards have "Profile pending verification" on)                      |
| Photography (mentorship, classroom, library)    | `src/lib/constants/images.ts` + `/public/images`                                                           |
| Orientation and demo dates                      | `src/data/events.ts` (template in the file header)                                                         |
| Noticeboard announcements                       | `src/data/announcements.ts` (ships empty; same field names as the Sanity `announcement` document)          |
| Practice quizzes                                | `src/data/quizzes.ts` (ships empty; a quiz without `href` renders as "Opens <date>", never as a dead link) |
| Course durations, schedules, fees               | `src/data/courses.ts`                                                                                      |
| Free resource PDFs                              | `src/data/resources.ts` (`href: ""` → request flow)                                                        |
| Batch start dates, timings, fees                | `src/data/batches.ts` (ships empty; template in the file header)                                           |
| Brochure PDF                                    | `BROCHURE.href` in `src/lib/constants/site.ts` (null → emailed by the team)                                |
| Student app store links                         | `APP` in `src/lib/constants/site.ts` (`available: false` → "notify me")                                    |
| YouTube channel and video ids                   | `YOUTUBE` in `src/lib/constants/site.ts` (empty ids → channel invitation)                                  |
| Target exam cycle                               | `EXAM_CYCLE` in `src/lib/constants/site.ts`                                                                |

**Not fabricated anywhere:** testimonials, results, batches, events, announcements, quizzes and current-affairs articles ship empty on purpose. The homepage renders honest empty states for them instead of invented content. Add real entries with `status: "published"` and the sections switch to cards automatically.

The performance-tracking figures on the homepage are a labelled UI illustration ("Sample Student Dashboard"), not student data.

## Leads

Every form posts to `POST /api/leads`, which re-validates with the same Zod schema, rate-limits per IP (5 per 10 minutes), drops honeypot submissions silently, then hands a normalised `Lead` to the sinks in `src/lib/leads/service.ts`. `Lead.email` is optional because the callback form asks only for a name, a number and a time slot. Today that is a console sink; add a CRM adapter implementing `LeadSink` and register it in `resolveSinks()` — forms and routes need no changes.

## Accessibility

Lighthouse scores 100 for accessibility, best practices and SEO on the homepage and the counselling page (mobile, navigation mode). Two things to preserve when editing:

- `--color-kesar` is decorative — it is 2.2:1 on white, reaches AA on indigo (6.1:1), and carries the `kesar` button with `indigo-900` text (7.3:1). Text on white or `paper` uses `--color-kesar-600`; text on the `kesar-100` wash uses `--color-kesar-700`. The hero headline accent is a kesar wash behind indigo text, never kesar type on white.
- A `<dl>` may only contain `<div>` wrappers whose direct children are `<dt>`/`<dd>`. Don't nest them inside another element for layout; use grid placement instead.

## Analytics

`track(ANALYTICS_EVENTS.x, payload)` pushes to `window.dataLayer`. Wire GA4/GTM/Meta Pixel by loading their script; no component changes are required.

Student learning events (`videoStarted`, `pdfOpened`, `testCompleted`, …) are a
separate, server-side stream: `activityService.record()` appends one Firestore
document per event, for the personalisation and BigQuery work later.

## Backend

Firebase is the application backend, Cloudinary stores the files, Sanity is the
CMS. Full setup in [`docs/firebase.md`](./docs/firebase.md),
[`docs/cloudinary.md`](./docs/cloudinary.md) and
[`docs/sanity.md`](./docs/sanity.md).

```bash
npm run firebase:deploy:firestore   # rules + indexes
npm run firebase:emulators          # local Auth + Firestore
```

Firebase Storage is not used and must not be enabled: every file is a Cloudinary
`authenticated` asset, read through a URL that expires in minutes.

Authorisation has three layers and needs all of them —
[`docs/security.md`](./docs/security.md):

| Layer               | Where                                                            |
| ------------------- | ---------------------------------------------------------------- |
| Optimistic redirect | `src/proxy.ts`                                                   |
| Real server check   | `lib/auth/server.ts`, inside every service                       |
| Direct-client check | `firestore.rules`                                                |
| File access         | `services/storage/storage.service.ts` — no rules layer behind it |

## Next step

Build the sign-in form on `/login`, calling `signInWithEmail()` from
`lib/auth/client.ts`. Everything behind it — session cookie, roles, guards,
services, portals — is in place and waiting on it; `/login` is still the
placeholder page from the marketing site.
