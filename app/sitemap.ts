import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/how-it-works", "/venue", "/origin", "/register"];
  return paths.map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: path === "/register" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
