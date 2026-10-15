import { mobileRoute, ok } from "@/lib/mobile/http";
import { toNotificationView } from "@/lib/mobile/views";
import { notificationService } from "@/services/notifications/notification.service";

export const GET = mobileRoute(async (request: Request) => {
  const params = new URL(request.url).searchParams;
  const limit = Number(params.get("limit") ?? 20);
  const cursor = params.get("cursor");

  const page = await notificationService.listOwn({
    limit: Number.isFinite(limit) ? limit : 20,
    cursor: cursor && /^[A-Za-z0-9_-]{1,128}$/.test(cursor) ? cursor : null,
  });

  return ok({ items: page.items.map(toNotificationView), nextCursor: page.nextCursor });
});
