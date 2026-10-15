import { requireAuth } from "@/lib/auth/server";
import { mobileRoute, ok, parseBody } from "@/lib/mobile/http";
import { getMe } from "@/lib/mobile/views";
import { profilePatchSchema } from "@/lib/validation/mobile";
import { studentService } from "@/services/students/student.service";

export const GET = mobileRoute(async () => ok(await getMe()));

/**
 * The student's own profile and study preferences. The uid is the session's;
 * `studentService.updateProfile` additionally restricts a self-edit to the
 * fields a student may change (never roll number, mentor or enrollments).
 */
export const PATCH = mobileRoute(async (request: Request) => {
  const user = await requireAuth();
  const patch = await parseBody(request, profilePatchSchema);
  await studentService.updateProfile(user.uid, patch);
  return ok(await getMe());
});
