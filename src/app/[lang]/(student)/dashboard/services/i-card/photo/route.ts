import { NextResponse } from "next/server";

import { revalidateLocalizedPath } from "@/i18n/revalidate";
import { getCurrentUserProfile, requireAuth } from "@/lib/auth/server";
import { AppError, ERROR_CODES, toAppError } from "@/lib/errors";
import { storageService } from "@/services/storage/storage.service";
import { userService } from "@/services/users/user.service";

/**
 * Profile photograph upload.
 *
 * A Route Handler rather than a Server Action because Server Actions cap their
 * request body at 1 MB by default, and a phone camera's JPEG clears that
 * routinely. Raising the cap would raise it for every action in the app.
 *
 * The upload is a three-step write — object, then `users/{uid}.photoPath`, then
 * the old object — and the order matters: the pointer only moves once the new
 * file is safely stored, and the previous photo is deleted last, so a failure
 * anywhere leaves the student with a photo rather than a broken reference.
 */
export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    const form = await request.formData().catch(() => null);
    const file = form?.get("photo");

    if (!(file instanceof File)) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, {
        message: "Choose a photograph to upload.",
      });
    }

    const previous = (await getCurrentUserProfile())?.photoPath ?? null;

    const path = await storageService.uploadOwnAvatar({
      bytes: await file.arrayBuffer(),
      contentType: file.type,
      fileName: file.name,
    });

    await userService.updateProfile(user.uid, { photoPath: path });

    if (previous && previous !== path) {
      // Housekeeping only. A leftover object is harmless; failing the request
      // after the new photo is already live is not.
      await storageService.removeOwnAvatar(previous).catch(() => undefined);
    }

    revalidateLocalizedPath("/dashboard/services/i-card");

    return NextResponse.json({ ok: true });
  } catch (error) {
    const appError = toAppError(error);
    return NextResponse.json(appError.toJSON(), { status: appError.status });
  }
}
