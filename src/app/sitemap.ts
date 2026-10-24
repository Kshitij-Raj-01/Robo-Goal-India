import type { MetadataRoute } from "next";
import { site, events, teams, robots, documents } from "@/lib/content";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "about",
    "tour",
    "events",
    "fixtures",
    "gallery",
    "partners",
    "sponsors",
    "collaborate",
    "contact",
    "leaderboard",
    "teams",
    "robots",
    ...events.map((e) => `events/${e.slug}`),
    ...teams.map((t) => `teams/${t.slug}`),
    ...robots.map((r) => `robots/${r.slug}`),
    ...documents.filter((d) => d.published).map((d) => `documents/${d.slug}`),
  ].map((path) => ({
    url: `${site.url}/${path}`,
    changeFrequency: path ? "weekly" : "monthly",
    priority: path ? 0.7 : 1,
  }));
}
