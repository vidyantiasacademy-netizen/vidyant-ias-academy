import { mobileRoute, ok, parseBody } from "@/lib/mobile/http";
import { registerDeviceSchema } from "@/lib/validation/mobile";
import { pushDeviceService } from "@/services/devices/push-device.service";

export const POST = mobileRoute(async (request: Request) => {
  const body = await parseBody(request, registerDeviceSchema);
  await pushDeviceService.registerOwn(body);
  return ok({ registered: true });
});
