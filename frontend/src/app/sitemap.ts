import type { MetadataRoute } from "next";
import { fetchProfileIndex } from "@/lib/api";

// Revalidate the sitemap hourly so newly claimed pages get indexed without a
// deploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://wsio.lol").replace(/\/$/, "");
  const today = new Date().toISOString().split("T")[0];

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: today, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/register`, lastModified: today, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/login`, lastModified: today, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/privacy`, lastModified: today, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/terms`, lastModified: today, changeFrequency: "yearly", priority: 0.2 },
  ];

  const profiles = await fetchProfileIndex();
  const profileRoutes: MetadataRoute.Sitemap = profiles.map((p) => ({
    url: `${baseUrl}/${encodeURIComponent(p.username)}`,
    lastModified: p.updatedAt || today,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...profileRoutes];
}
