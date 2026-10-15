import { mobileRoute, ok, pathId } from "@/lib/mobile/http";
import { notificationService } from "@/services/notifications/notification.service";

export const POST = mobileRoute(
  async (
    _request: Request,
    ctx: RouteContext<"/api/mobile/v1/notifications/[notificationId]/read">,
  ) => {
    const { notificationId } = await ctx.params;
    await notificationService.markRead(pathId(notificationId));
    return ok({ read: true });
  },
);
