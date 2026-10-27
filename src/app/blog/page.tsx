import Link from "next/link";
import Image from "next/image";
import { getBlogs } from "@/lib/cms";
import { PageHero, EmptyState } from "@/components/ui";
export const metadata = {
  title: "RGI Blog — Robotics, learning and competition",
  description:
    "Stories, engineering guides and updates from Robo Goal India (RGI).",
  alternates: { canonical: "/blog" },
};
export default async function BlogIndex() {
  const posts = await getBlogs();
  return (
    <>
      <PageHero
        eyebrow="RGI / JOURNAL"
        title="IDEAS FROM"
        accent="THE ARENA."
        description="Robotics, practical learning and the people building Robo Goal India (RGI)."
      />
      <section className="section container">
        {posts.length ? (
          <div className="event-grid">
            {posts.map((post) => (
              <article className="info-card" key={post.slug}>
                {post.cover && (
                  <Image
                    src={post.cover}
                    unoptimized={post.cover.startsWith("/media/")}
                    alt={post.title}
                    width={700}
                    height={450}
                  />
                )}
                <p className="micro">
                  {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                    timeZone: "Asia/Kolkata",
                  })}{" "}
                  · {post.author}
                </p>
                <h2>
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p>{post.excerpt}</p>
                <Link className="text-link" href={`/blog/${post.slug}`}>
                  Read article ↗
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="The RGI journal is coming into play."
            description="Published articles and engineering stories will appear here."
          />
        )}
      </section>
    </>
  );
}
