import { mobileRoute, ok, parseBody, pathId } from "@/lib/mobile/http";
import { submitAttemptSchema } from "@/lib/validation/entities";
import { testService } from "@/services/tests/test.service";

/**
 * Submits and scores the paper server-side. Returns only whether a scorecard
 * exists — the result screen fetches it through the release-date check, so
 * this cannot become a second, unguarded way to read a score early.
 */
export const POST = mobileRoute(
  async (request: Request, ctx: RouteContext<"/api/mobile/v1/attempts/[attemptId]/submit">) => {
    const { attemptId } = await ctx.params;
    const body = await parseBody(request, submitAttemptSchema, { attemptId: pathId(attemptId) });
    const result = await testService.submitAttempt(body);
    return ok({ scored: result !== null });
  },
);
