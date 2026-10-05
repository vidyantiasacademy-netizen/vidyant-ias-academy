# Exam sweep — auto-submitting abandoned papers

## What it is

When a student closes the tab, loses their connection or runs out of battery in
the middle of a paper, nobody is left to press Submit. The timer runs on the
server, so the paper's time does run out — but until something finalises it,
the attempt stays "in progress" for ever: no scorecard, no rank, and the
student cannot sit it again.

`POST /api/exams/sweep` finds every attempt whose time is up, submits it with
whatever answers were saved before the deadline, and scores it. Something has to
call it every couple of minutes. That caller is what this page sets up.

```
every 2 min ──► POST /api/exams/sweep  (header: x-exam-sweep-secret)
                    │
                    ├─ wrong / missing secret → 401, does nothing
                    └─ finds in-progress attempts past expiresAt (50 per call)
                       → submits + scores each → {"ok":true,"finalised":N}
```

Calling it more often than needed is harmless: a run with nothing to do returns
`"finalised": 0`.

The caller is a free Cloudflare Worker (`ops/exam-sweep-worker/`):

```
Cloudflare Worker (cron */2) ──► your website /api/exams/sweep ──► Firestore
```

## Production setup (one time)

### 1. Make a secret

```bash
openssl rand -base64 32
```

Use a **different** value from the one in your `.env.local`. Keep it in a
password manager; anyone who has it can trigger sweeps (which only ever submit
papers that are already out of time, but it is still a credential).

### 2. Give it to the website

Add `EXAM_SWEEP_SECRET=<the value>` to the hosting platform's environment
variables for **production**, then redeploy so the running site picks it up.

Check it took effect — this must return `401`, not `500` or `404`:

```bash
curl -i -X POST https://<your-live-domain>/api/exams/sweep
```

### 3. Deploy the scheduler — Cloudflare Worker (free)

The clock is a small Cloudflare Worker in `ops/exam-sweep-worker/`. It runs on
Cloudflare's **free** Workers plan: every two minutes is 720 runs a day against a
100,000-a-day limit, and the free plan allows 5 cron schedules per account. Waiting
for the website to answer does not count against the free plan's CPU limit. The
Worker has no public URL; it only runs on its schedule.

One-time, from the repo root:

1. Create a free account at <https://dash.cloudflare.com/sign-up>. No domain is
   needed.
2. Put the live URL in `ops/exam-sweep-worker/wrangler.jsonc`:

   ```jsonc
   "SWEEP_URL": "https://<your-live-domain>/api/exams/sweep"
   ```

   Until this is changed, every run fails on purpose with "SWEEP_URL is not set".
3. Log in, store the secret, deploy:

   ```bash
   cd ops/exam-sweep-worker
   npx wrangler@4 login                          # opens the browser once
   npx wrangler@4 secret put EXAM_SWEEP_SECRET   # paste the secret from step 1
   npx wrangler@4 deploy
   ```

   The secret is stored encrypted in Cloudflare, never in the repo. If the
   `secret put` command offers to create the Worker first, answer yes.

### 4. Confirm it is running

Wait two minutes, then Cloudflare dashboard → **Workers & Pages** →
`vidyantias-exam-sweep` → **Settings** → **Trigger Events** → **View events**.
Runs should show as successful. The Worker's logs show lines like
`sweep ok …: {"ok":true,"finalised":0}` — `0` simply means nobody had an
abandoned paper at that moment.

A failed run means the Worker threw. The log says why:

| Log message | Meaning |
| --- | --- |
| `SWEEP_URL is not set` | Step 3.2 skipped — the placeholder is still in `wrangler.jsonc` |
| `EXAM_SWEEP_SECRET is not set` | `secret put` was not run, or was run before the Worker existed |
| `Sweep returned 401` | The secret in Cloudflare and on the website differ, or the site was not redeployed after adding it |
| `Sweep returned 404` | Wrong URL, or the live site is an older deploy without the route |
| `Sweep returned 5xx` | The sweep ran and failed — check the website's logs for `[exam-sweep]` |

Changing the schedule or URL later: edit `wrangler.jsonc` and run
`npx wrangler@4 deploy` again.

## Other schedulers

Anything that can send a `POST` with a custom header on a schedule works:

- **cron-job.org** — free, no code: create a job for the sweep URL every 2
  minutes, method POST, header `x-exam-sweep-secret`. The secret then sits with
  a third party (it can only trigger sweeps, which only submit papers already
  out of time).
- **Google Cloud Scheduler** — needs the Firebase project on the Blaze plan.
- **Vercel Cron** — sends `GET` with an `Authorization: Bearer` header, so it
  would need a second handler on the route; once a day on the Hobby plan.
- **GitHub Actions `schedule`** — five-minute minimum, often delayed further.

## Rotating the secret

Set the new value on the website and redeploy, then straight away run
`npx wrangler@4 secret put EXAM_SWEEP_SECRET` in `ops/exam-sweep-worker` with
the same value. Sweeps fail with 401 in between, which only delays
scorecards by a few minutes.

## Local testing

`EXAM_SWEEP_SECRET` in `.env.local` enables the route under `npm run dev` /
`npm run dev:emulator`. Nothing calls it automatically there; trigger a sweep
by hand:

```bash
curl -X POST http://localhost:3000/api/exams/sweep \
  -H "x-exam-sweep-secret: <value from .env.local>"
```

Or run the Worker itself against the local site and fire one scheduled run:

```bash
cd ops/exam-sweep-worker
npx wrangler@4 dev --port 8787 \
  --var "SWEEP_URL:http://localhost:3000/api/exams/sweep" \
  --var "EXAM_SWEEP_SECRET:<value from .env.local>"
# in another terminal:
curl "http://localhost:8787/cdn-cgi/local/scheduled?cron=*/2+*+*+*+*&format=json"
# → {"outcome":"ok"} and "sweep ok …" in the wrangler output
```
