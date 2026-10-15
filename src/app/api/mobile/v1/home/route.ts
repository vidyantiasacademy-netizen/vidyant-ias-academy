import { mobileRoute, ok } from "@/lib/mobile/http";
import { getHome } from "@/lib/mobile/views";

export const GET = mobileRoute(async () => ok(await getHome()));
