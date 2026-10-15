import { mobileRoute, ok, pathId } from "@/lib/mobile/http";
import { getPaperDetail } from "@/lib/mobile/views";

export const GET = mobileRoute(
  async (_request: Request, ctx: RouteContext<"/api/mobile/v1/papers/[testId]">) => {
    const { testId } = await ctx.params;
    return ok(await getPaperDetail(pathId(testId)));
  },
);
