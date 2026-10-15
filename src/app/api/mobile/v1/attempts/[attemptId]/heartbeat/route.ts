import { mobileRoute, ok, parseBody, pathId } from "@/lib/mobile/http";
import { toAttemptState } from "@/lib/mobile/views";
import { attemptHeartbeatSchema } from "@/lib/validation/entities";
import { testService } from "@/services/tests/test.service";

/** The authoritative clock. The countdown on the phone is a copy of this number. */
export const POST = mobileRoute(
  async (request: Request, ctx: RouteContext<"/api/mobile/v1/attempts/[attemptId]/heartbeat">) => {
    const { attemptId } = await ctx.params;
    const body = await parseBody(request, attemptHeartbeatSchema, {
      attemptId: pathId(attemptId),
    });
    return ok(toAttemptState(await testService.heartbeat(body)));
  },
);
