import type { MetadataRoute } from "next";
import { site, events, teams, robots, documents } from "@/lib/content";
import { getContent, getBlogs } from "@/lib/cms";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { events } = await getContent();
  const blogs = await getBlogs();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || site.url;
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
    "blog",
    ...blogs.map((b) => `blog/${b.slug}`),
    "leaderboard",
    "teams",
    "robots",
    ...events.map((e) => `events/${e.slug}`),
    ...teams.map((t) => `teams/${t.slug}`),
    ...robots.map((r) => `robots/${r.slug}`),
    ...documents.filter((d) => d.published).map((d) => `documents/${d.slug}`),
  ].map((path) => ({
    url: `${origin}/${path}`,
    changeFrequency: path ? "weekly" : "monthly",
    priority: path ? 0.7 : 1,
  }));
}
