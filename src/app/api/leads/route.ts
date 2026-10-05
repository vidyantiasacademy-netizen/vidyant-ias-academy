import { NextResponse } from "next/server";

import { rateLimit, pruneRateLimitWindows } from "@/lib/leads/rate-limit";
import { submitLead } from "@/lib/leads/service";
import {
  leadSubmissionSchema,
  schemaForForm,
} from "@/lib/validation/schemas";

/** Lead intake for every public form. Validates server-side, then fans out to sinks. */
export async function POST(request: Request) {
  pruneRateLimitWindows();

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const limit = rateLimit(`leads:${ip}`);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    );
  }

  const envelope = leadSubmissionSchema.safeParse(body);
  if (!envelope.success) {
    return NextResponse.json(
      { ok: false, error: "invalid_request" },
      { status: 422 },
    );
  }

  const parsed = schemaForForm(envelope.data.form).safeParse(
    envelope.data.data,
  );
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "invalid_fields" },
      { status: 422 },
    );
  }

  // Honeypot filled in => silently accept so bots don't learn the rule.
  const honeypot = (parsed.data as { honeypot?: string }).honeypot;
  if (honeypot) {
    return NextResponse.json({ ok: true, id: "ignored" }, { status: 202 });
  }

  try {
    const lead = await submitLead({
      form: envelope.data.form,
      data: parsed.data as Record<string, unknown>,
      context: envelope.data.context,
    });
    return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { ok: false, error: "delivery_failed" },
      { status: 502 },
    );
  }
}
