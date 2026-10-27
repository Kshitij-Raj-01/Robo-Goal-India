import type { MetadataRoute } from "next";
import { site } from "@/lib/content";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/cms-admin/", "/enquiries-admin", "/api/"],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || site.url}/sitemap.xml`,
  };
}
