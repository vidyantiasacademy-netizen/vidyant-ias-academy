import { createHmac, timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";

/**
 * Mux webhook.
 *
 * Mux uploads are asynchronous: a lesson's video is unplayable for a minute or
 * two after upload while Mux transcodes it. This route is how the lesson
 * document learns that the asset is ready, and its duration — neither of which
 * the uploader knows at upload time.
 *
 * Configure at Mux Dashboard → Settings → Webhooks:
 *   URL     https://www.vidyantias.com/api/webhooks/mux
 *   Secret  the value of MUX_WEBHOOK_SECRET
 */

interface MuxEvent {
  type: string;
  data: {
    id: string;
    duration?: number;
    passthrough?: string;
    errors?: { messages?: string[] };
  };
}

/**
 * Verifies the `Mux-Signature: t=<ts>,v1=<hex>` header.
 *
 * The timestamp is part of the signed payload *and* checked for age: without
 * the age check a captured webhook could be replayed indefinitely.
 */
function verifySignature(rawBody: string, header: string | null): boolean {
  const secret = process.env.MUX_WEBHOOK_SECRET;
  if (!secret || !header) return false;

  const parts = Object.fromEntries(
    header.split(",").map((part) => part.split("=") as [string, string]),
  );

  const timestamp = parts.t;
  const received = parts.v1;

  if (!timestamp || !received) return false;

  const ageSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(ageSeconds) || ageSeconds > 300) return false;

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(received, "utf8");

  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  if (!verifySignature(rawBody, request.headers.get("mux-signature"))) {
    return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 401 });
  }

  try {
    const event = JSON.parse(rawBody) as MuxEvent;

    // Set when creating the asset: `passthrough: lessonId`. It is how an asset
    // maps back to a lesson without an extra lookup table.
    const lessonId = event.data.passthrough;
    if (!lessonId) return NextResponse.json({ ok: true, applied: false });

    const ref = getAdminDb().collection(COLLECTIONS.lessons).doc(lessonId);

    if (event.type === "video.asset.ready") {
      await ref.update({
        muxAssetId: event.data.id,
        durationSeconds: event.data.duration ? Math.round(event.data.duration) : null,
        updatedAt: new Date(),
        updatedBy: "system",
      });

      return NextResponse.json({ ok: true, applied: true });
    }

    if (event.type === "video.asset.errored") {
      console.error("[mux] asset failed", lessonId, event.data.errors?.messages);
      return NextResponse.json({ ok: true, applied: false });
    }

    return NextResponse.json({ ok: true, applied: false });
  } catch (error) {
    console.error("[mux] webhook handling failed", error);
    return NextResponse.json({ ok: false, error: "handler_failed" }, { status: 500 });
  }
}
