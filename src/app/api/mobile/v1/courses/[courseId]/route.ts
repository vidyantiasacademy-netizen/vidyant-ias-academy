import { mobileRoute, ok, pathId } from "@/lib/mobile/http";
import { getCourseDetail } from "@/lib/mobile/views";

export const GET = mobileRoute(
  async (_request: Request, ctx: RouteContext<"/api/mobile/v1/courses/[courseId]">) => {
    const { courseId } = await ctx.params;
    return ok(await getCourseDetail(pathId(courseId)));
  },
);
