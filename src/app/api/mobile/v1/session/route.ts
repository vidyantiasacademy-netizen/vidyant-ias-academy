import { requireAuth } from "@/lib/auth/server";
import { mobileRoute, ok } from "@/lib/mobile/http";
import { getMe } from "@/lib/mobile/views";
import { userService } from "@/services/users/user.service";

/**
 * Called once after every sign-in on the app — the counterpart of the website's
 * `POST /api/auth/session`, minus the cookie. Creates `users/{uid}` and
 * `students/{uid}` on a first sign-in (the client must never write its own
 * role) and stamps `lastLoginAt` afterwards.
 */
export const POST = mobileRoute(async () => {
  const user = await requireAuth();
  await userService.ensureUserDocuments(user.uid);
  return ok(await getMe());
});
