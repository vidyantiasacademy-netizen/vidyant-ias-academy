import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { testService } from "@/services/tests/test.service";

/**
 * Finalises sittings whose time is up and whose window is gone.
 *
 * Why this exists: "the timer does not pause when you close the laptop" is only
 * true if something submits the paper when nobody is there to submit it. Without
 * this route an abandoned attempt stays `in-progress` for ever, which means no
 * scorecard, no entry in the rank list, and a student who cannot retry because
 * their own unfinished attempt is in the way.
 *
 * It is also the backstop for the obvious attack: start a paper, pull the network
 * cable so no heartbeat and no submit can be sent, and read the questions at
 * leisure. The sweeper submits and scores exactly what was saved before the
 * deadline, whatever happened to the browser afterwards.
 *
 * Call it on a schedule — Cloud Scheduler, a cron job, any pinger:
 *
 *   POST https://www.vidyantias.com/api/exams/sweep
 *   x-exam-sweep-secret: <EXAM_SWEEP_SECRET>
 *
 * Every two minutes is ample: the grace period is seconds and the only cost of a
 * late sweep is a scorecard that appears a minute after the bell.
 *
 * There is no session behind this request, so the shared secret is the whole of
 * the authorisation — which is why the comparison is constant-time and why the
 * route refuses outright when the variable is unset rather than running
 * unauthenticated.
 */

function authorised(request: Request): boolean {
  const expected = process.env.EXAM_SWEEP_SECRET;
  const received = request.headers.get("x-exam-sweep-secret");

  if (!expected || !received) return false;

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(received, "utf8");

  // `===` on a secret leaks it one byte at a time through response timing.
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!authorised(request)) {
    // Deliberately indistinguishable from a wrong secret and a missing one: a
    // caller learning that the feature is unconfigured learns something.
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const { finalised } = await testService.sweepExpiredAttempts();
    return NextResponse.json({ ok: true, finalised });
  } catch (error) {
    console.error("[exam-sweep] failed", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
