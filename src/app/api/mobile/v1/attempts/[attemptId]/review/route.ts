import { mobileRoute, ok, pathId } from "@/lib/mobile/http";
import { getReview } from "@/lib/mobile/views";

/** Answer key and explanations — only after the paper's result release date. */
export const GET = mobileRoute(
  async (_request: Request, ctx: RouteContext<"/api/mobile/v1/attempts/[attemptId]/review">) => {
    const { attemptId } = await ctx.params;
    return ok(await getReview(pathId(attemptId)));
  },
);
