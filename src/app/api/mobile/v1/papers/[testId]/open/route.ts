import { mobileRoute, ok, pathId } from "@/lib/mobile/http";
import { openExam } from "@/lib/mobile/views";

/**
 * Starts or resumes a sitting — `testService.openExam`, the same single entry
 * point the website's exam route uses. Issues a fresh session token, which
 * evicts any other device or tab holding the paper.
 */
export const POST = mobileRoute(
  async (_request: Request, ctx: RouteContext<"/api/mobile/v1/papers/[testId]/open">) => {
    const { testId } = await ctx.params;
    return ok(await openExam(pathId(testId)));
  },
);
