import { mobileRoute, ok } from "@/lib/mobile/http";
import { listCourses } from "@/lib/mobile/views";

export const GET = mobileRoute(async () => ok(await listCourses()));
