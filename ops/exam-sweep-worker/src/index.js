/**
 * Calls the website's exam sweep every two minutes (see `wrangler.jsonc`), so a
 * paper abandoned mid-sitting is submitted and scored once its time is up.
 * The sweep itself lives in the Next.js app — `POST /api/exams/sweep` — and this
 * Worker is only the clock. Setup: `docs/exam-sweep.md`.
 *
 * Throwing on anything but a 2xx is deliberate: it is what marks the run as
 * failed under Cron Events in the Cloudflare dashboard, which is the only place
 * anyone will notice that sweeps have stopped working.
 */

const PLACEHOLDER = "REPLACE-WITH-LIVE-DOMAIN";

const worker = {
  async scheduled(controller, env) {
    if (!env.SWEEP_URL || env.SWEEP_URL.includes(PLACEHOLDER)) {
      throw new Error("SWEEP_URL is not set. Put the live site's URL in wrangler.jsonc and deploy again.");
    }

    if (!env.EXAM_SWEEP_SECRET) {
      throw new Error("EXAM_SWEEP_SECRET is not set. Run: npx wrangler@4 secret put EXAM_SWEEP_SECRET");
    }

    const response = await fetch(env.SWEEP_URL, {
      method: "POST",
      headers: { "x-exam-sweep-secret": env.EXAM_SWEEP_SECRET },
      // Well inside the two-minute interval, so a hung request cannot overlap
      // the next run.
      signal: AbortSignal.timeout(30_000),
    });

    const body = await response.text();

    if (!response.ok) {
      // 401: the secret here and on the website differ. 404: wrong URL or an old
      // deploy. 5xx: the sweep ran and failed — check the website's logs.
      throw new Error(`Sweep returned ${response.status}: ${body.slice(0, 200)}`);
    }

    console.log(`sweep ok at ${new Date(controller.scheduledTime).toISOString()}: ${body}`);
  },
};

export default worker;
