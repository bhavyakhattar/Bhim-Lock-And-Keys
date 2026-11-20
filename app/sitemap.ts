import type { MetadataRoute } from "next";
import { siteURL } from "@/lib/shop";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/privacy", "/terms"].map((path) => ({
    url: `${siteURL}${path}`,
    changeFrequency: "monthly",
    priority: path ? 0.3 : 1,
  }));
}
