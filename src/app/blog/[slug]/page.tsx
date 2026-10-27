import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getBlog } from "@/lib/cms";
import { PageHero, JsonLd } from "@/components/ui";
import { site } from "@/lib/content";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlog((await params).slug);
  if (!post)
    return {
      title: "Article not found",
      robots: { index: false, follow: false },
    };
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      images: post.cover ? [post.cover] : [],
    },
  };
}
export default async function BlogDetail({ params }: Props) {
  const post = await getBlog((await params).slug);
  if (!post) notFound();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || site.url;
  return (
    <>
      <PageHero
        eyebrow="RGI / JOURNAL"
        title={post.title}
        description={post.excerpt}
      />
      <article className="section container blog-article prose">
        <p>
          {post.author} ·{" "}
          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString("en-IN", {
              timeZone: "Asia/Kolkata",
              dateStyle: "long",
            })}
          </time>
        </p>
        {post.cover && (
          <Image
            className="detail-image"
            src={post.cover}
            unoptimized={post.cover.startsWith("/media/")}
            alt={post.title}
            width={1400}
            height={900}
          />
        )}
        {/* Only Django's allowlist-sanitized Markdown HTML is accepted here. */}
        <div dangerouslySetInnerHTML={{ __html: post.html || "" }} />
      </article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt,
          author: { "@type": "Person", name: post.author },
          publisher: { "@type": "Organization", name: "Robo Goal India (RGI)" },
          mainEntityOfPage: `${origin}/blog/${post.slug}`,
          ...(post.cover ? { image: new URL(post.cover, origin).href } : {}),
        }}
      />
    </>
  );
}
