import { NextResponse } from "next/server";
import { z } from "zod";

import { AppError, ERROR_CODES, toAppError } from "@/lib/errors";
import { storageService } from "@/services/storage/storage.service";

/**
 * Signs one direct-to-Cloudinary upload.
 *
 * This route is the only reason a browser can write to the media account at
 * all, and it is deliberately narrow: it signs one exact public id, for one
 * caller, with a format whitelist, after `storageService.signUpload()` has
 * checked that this user may write there. There is no upload preset — an
 * unsigned preset would make the cloud name itself a write credential.
 *
 * The signature it returns is good for one upload, and Cloudinary has no rules
 * layer that would re-check it at the account — so what this route authorises
 * is what happens.
 */

const bodySchema = z.object({
  // A public id from `MEDIA_PATHS`: slashes yes, no leading slash, no dots —
  // a dot here would collide with the format suffix in a media reference.
  path: z
    .string()
    .min(3)
    .max(400)
    .regex(/^[\w-]+(\/[\w-]+)+$/, "Invalid upload path."),
  kind: z.enum(["image", "document", "answerSheet"]),
});

export async function POST(request: Request) {
  try {
    const parsed = bodySchema.safeParse(await request.json().catch(() => null));

    if (!parsed.success) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, {
        message: "Invalid upload request.",
      });
    }

    const ticket = await storageService.signUpload(parsed.data.path, parsed.data.kind);

    return NextResponse.json(ticket, {
      // A signature is a credential with a short life. Nothing may cache it.
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    const appError = toAppError(error);
    return NextResponse.json(appError.toJSON(), { status: appError.status });
  }
}
