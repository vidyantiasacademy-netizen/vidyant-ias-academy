import { mobileRoute, ok, pathId } from "@/lib/mobile/http";
import { getResultView } from "@/lib/mobile/views";

export const GET = mobileRoute(
  async (_request: Request, ctx: RouteContext<"/api/mobile/v1/attempts/[attemptId]/result">) => {
    const { attemptId } = await ctx.params;
    return ok(await getResultView(pathId(attemptId)));
  },
);
