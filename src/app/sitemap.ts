import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { path: "/", priority: 1, freq: "weekly" },
    { path: "/portfolio", priority: 0.9, freq: "weekly" },
    { path: "/diensten", priority: 0.9, freq: "monthly" },
    { path: "/over-mij", priority: 0.7, freq: "monthly" },
    { path: "/contact", priority: 0.8, freq: "yearly" },
    { path: "/privacy", priority: 0.2, freq: "yearly" },
    { path: "/voorwaarden", priority: 0.2, freq: "yearly" },
  ].map((p) => ({
    url: absoluteUrl(p.path),
    lastModified: now,
    changeFrequency: p.freq as MetadataRoute.Sitemap[number]["changeFrequency"],
    priority: p.priority,
  }));
}
