import { mobileRoute, ok } from "@/lib/mobile/http";
import { getPerformance } from "@/lib/mobile/views";

export const GET = mobileRoute(async () => ok(await getPerformance()));
