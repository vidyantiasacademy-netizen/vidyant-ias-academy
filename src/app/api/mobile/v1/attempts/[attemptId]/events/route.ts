import { AppError, ERROR_CODES } from "@/lib/errors";
import { mobileRoute, ok, parseBody, pathId } from "@/lib/mobile/http";
import { toAttemptState } from "@/lib/mobile/views";
import { proctorEventSchema } from "@/lib/validation/entities";
import { MOBILE_PROCTOR_EVENTS } from "@/lib/validation/mobile";
import { testService } from "@/services/tests/test.service";

/**
 * Invigilation events a phone can observe: the app leaving the foreground, and
 * coming back. Weighed by the same `VIOLATION_WEIGHTS` as the website.
 */
export const POST = mobileRoute(
  async (request: Request, ctx: RouteContext<"/api/mobile/v1/attempts/[attemptId]/events">) => {
    const { attemptId } = await ctx.params;
    const body = await parseBody(request, proctorEventSchema, { attemptId: pathId(attemptId) });

    if (!(MOBILE_PROCTOR_EVENTS as readonly string[]).includes(body.type)) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, { message: "Unsupported event." });
    }

    const state = await testService.recordProctorEvent({
      ...body,
      // From the connection, not the body — see `reportProctorEventAction`.
      userAgent: request.headers.get("user-agent"),
    });
    return ok(toAttemptState(state));
  },
);
