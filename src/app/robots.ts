import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/constants/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // `/login` is not blocked: it is `noindex`, and a crawler has to be
      // allowed to fetch it to see that.
      disallow: ["/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
