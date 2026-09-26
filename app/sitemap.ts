import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/** One page: the chat. `/design` is a noindex preview and stays out. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl().toString(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
