import { AppError, ERROR_CODES } from "@/lib/errors";
import { mobileRoute, ok } from "@/lib/mobile/http";
import { pushDeviceService } from "@/services/devices/push-device.service";

export const DELETE = mobileRoute(
  async (_request: Request, ctx: RouteContext<"/api/mobile/v1/devices/[installationId]">) => {
    const { installationId } = await ctx.params;
    if (!/^[A-Za-z0-9-]{8,64}$/.test(installationId)) throw new AppError(ERROR_CODES.NOT_FOUND);
    await pushDeviceService.removeOwn(installationId);
    return ok({ removed: true });
  },
);
