import "server-only";
import { cache } from "react";
import { emptyContent, type CMSContent, type BlogPost } from "./cms-types";

async function read<T>(path: string, fallback: T): Promise<T> {
  const origin = process.env.CMS_INTERNAL_URL;
  if (!origin) {
    if (process.env.CMS_REQUIRED === "true")
      throw new Error("CMS_INTERNAL_URL is required.");
    return fallback;
  }
  try {
    const response = await fetch(
      `${origin.replace(/\/$/, "")}/cms-api/${path}`,
      {
        // Request-time content avoids separate stale caches across frontend replicas.
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
        headers: { "X-Forwarded-Proto": "https" },
      },
    );
    if (response.status === 404) return fallback;
    if (!response.ok) throw new Error(`CMS returned ${response.status}`);
    return (await response.json()) as T;
  } catch (error) {
    if (process.env.CMS_REQUIRED === "true") throw error;
    console.error("CMS unavailable; using local preview content.");
    return fallback;
  }
}
export const getContent = cache(async (): Promise<CMSContent> => {
  const data = await read<Partial<CMSContent>>("content/", {});
  return {
    ...emptyContent,
    ...data,
    site: { ...emptyContent.site, ...data.site },
  };
});
export const getBlogs = cache(
  async () =>
    (await read<{ blogs: BlogPost[] }>("blogs/", { blogs: [] })).blogs,
);
export const getBlog = cache(async (slug: string) =>
  read<BlogPost | null>(`blogs/${encodeURIComponent(slug)}/`, null),
);
