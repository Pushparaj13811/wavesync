import type { MetadataRoute } from "next";
import { playlists } from "@/data/playlists";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://wavesync.app";

  const playlistRoutes = playlists.map((p) => ({
    url: `${baseUrl}/playlist/${p.id}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/library`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...playlistRoutes,
  ];
}
