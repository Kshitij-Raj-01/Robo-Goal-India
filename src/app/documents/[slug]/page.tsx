import { notFound } from "next/navigation";
import { documents } from "@/lib/content";
import { PageHero, Button } from "@/components/ui";
export const dynamicParams = false;
export function generateStaticParams() {
  return documents.map((d) => ({ slug: d.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const d = documents.find((d) => d.slug === slug);
  return {
    title: d?.title || "Document not found",
    robots: { index: !!d?.published, follow: true },
  };
}
export default async function Document({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = documents.find((d) => d.slug === slug);
  if (!doc) notFound();
  return (
    <>
      <PageHero
        eyebrow="OFFICIAL DOCUMENTS"
        title={doc.title}
        description={
          doc.published
            ? "Official Robo Goal India information."
            : "Awaiting organizer approval and publication."
        }
      />
      <section className="section container document">
        <span className="status-tag">
          {doc.published ? "Published" : "Publication pending"}
        </span>
        <p>{doc.body}</p>
        <Button href="/contact" secondary>
          Contact the Organizer
        </Button>
      </section>
    </>
  );
}
