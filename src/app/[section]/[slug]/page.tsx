import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  events,
  teams,
  robots,
  site,
  media,
  judges,
  sponsors,
} from "@/lib/content";
import { PageHero, JsonLd } from "@/components/ui";
import { getContent } from "@/lib/cms";
type Props = { params: Promise<{ section: string; slug: string }> };
export const dynamicParams = true;
export function generateStaticParams({
  params,
}: {
  params: { section: string };
}) {
  const records =
    params.section === "events"
      ? events
      : params.section === "teams"
        ? teams
        : params.section === "robots"
          ? robots
          : [];
  return records.map((item) => ({ slug: item.slug }));
}
async function record(section: string, slug: string) {
  const { events } = await getContent();
  return section === "events"
    ? events.find((e) => e.slug === slug)
    : section === "teams"
      ? teams.find((e) => e.slug === slug)
      : section === "robots"
        ? robots.find((e) => e.slug === slug)
        : undefined;
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section, slug } = await params;
  const r = await record(section, slug);
  return {
    title: r ? ("title" in r ? r.title : r.name) : "Not found",
    alternates: { canonical: `/${section}/${slug}` },
  };
}
export default async function Detail({ params }: Props) {
  const { section, slug } = await params;
  const { events, media, site } = await getContent();
  const r = await record(section, slug);
  if (!r) notFound();
  if (section === "events") {
    const event = events.find((e) => e.slug === slug)!;
    return (
      <>
        <PageHero
          eyebrow={`OFFICIAL EVENT / ${event.status}`}
          title={event.title}
          description={`${event.city} · ${event.venue} · ${new Date(event.date).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "long" })}`}
        />
        <section className="section container">
          {event.cover && (
            <Image
              className="detail-image"
              src={event.cover}
              unoptimized={event.cover.startsWith("/media/")}
              alt={event.title}
              width={1400}
              height={800}
            />
          )}
          <dl className="detail-list">
            {Object.entries({
              Format: event.type,
              Teams: event.teams ?? "To be announced",
              Participants: event.participants ?? "To be announced",
              Winners: event.winners.join(", ") || "Awaiting official results",
              Results: event.results || "Awaiting official results",
              "Judges and guests":
                event.judges
                  .map((id) => judges.find((j) => j.id === id)?.name || id)
                  .join(", ") || "To be announced",
              Sponsors:
                event.sponsors
                  .map((id) => sponsors.find((s) => s.id === id)?.name || id)
                  .join(", ") || "To be announced",
            }).map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <div className="prose">
            <h2>EVENT HIGHLIGHTS</h2>
            <p>{event.highlights || "Highlights awaiting publication."}</p>
          </div>
          <div className="masonry">
            {media
              .filter(
                (m) => event.galleryIds.includes(m.id) && m.type === "image",
              )
              .map((m) => (
                <Image
                  key={m.id}
                  src={m.src}
                  unoptimized={m.src.startsWith("/media/")}
                  alt={m.alt}
                  width={m.width}
                  height={m.height}
                />
              ))}
          </div>
          <Link className="text-link" href="/events">
            ← Back to events
          </Link>
        </section>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "SportsEvent",
            name: event.title,
            startDate: event.date,
            endDate: event.endDate,
            eventStatus: "https://schema.org/EventScheduled",
            eventAttendanceMode:
              "https://schema.org/OfflineEventAttendanceMode",
            location: {
              "@type": "Place",
              name: event.venue,
              address: {
                "@type": "PostalAddress",
                addressLocality: event.city,
                addressCountry: "IN",
              },
            },
            organizer: {
              "@type": "Organization",
              name: site.organizer,
              url: site.parentUrl,
            },
            url: `${site.url}/events/${slug}`,
            image: event.cover
              ? new URL(event.cover, site.url).href
              : undefined,
            description: event.highlights || `${event.type} in ${event.city}`,
          }}
        />
      </>
    );
  }
  if (section === "teams") {
    const team = teams.find((t) => t.slug === slug)!;
    return (
      <>
        <PageHero
          eyebrow={`TEAM PROFILE / ${team.id}`}
          title={team.name}
          description={`${team.institution} · ${team.city}`}
        />
        <section className="section container content-grid">
          <div>
            {team.image && (
              <Image
                src={team.image}
                alt={team.name}
                width={700}
                height={500}
              />
            )}
            <dl className="detail-list">
              {Object.entries({
                Leader: team.leader,
                Members: team.members.join(", "),
                Achievements:
                  team.achievements.join(", ") || "No achievements published",
                Qualification: team.qualification,
              }).map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="prose">
            <h2>MATCH STATISTICS</h2>
            <dl className="detail-list">
              {Object.entries({
                Matches: team.matches,
                Goals: team.goals,
                Wins: team.wins,
                Points: team.points,
              }).map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <h3>Robots</h3>
            {robots
              .filter((r) => r.teamId === team.id)
              .map((r) => (
                <p key={r.slug}>
                  <Link href={`/robots/${r.slug}`}>{r.name} ↗</Link>
                </p>
              ))}
            <h3>Events</h3>
            {team.eventSlugs.map((s) => (
              <p key={s}>
                <Link href={`/events/${s}`}>
                  {events.find((e) => e.slug === s)?.title || s} ↗
                </Link>
              </p>
            ))}
          </div>
        </section>
      </>
    );
  }
  const robot = robots.find((r) => r.slug === slug)!;
  const team = teams.find((t) => t.id === robot.teamId);
  return (
    <>
      <PageHero
        eyebrow="ROBOT / ENGINEERING PROFILE"
        title={robot.name}
        description={`Engineered by ${team?.name || "Team to be announced"}`}
      />
      <section className="section container content-grid">
        <div>
          {robot.images.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt={`${robot.name}, view ${i + 1}`}
              width={700}
              height={500}
            />
          ))}
        </div>
        <div>
          <dl className="detail-list">
            {Object.entries({
              Weight: robot.weight,
              Dimensions: robot.dimensions,
              Motors: robot.motors,
              Controller: robot.controller,
              Battery: robot.battery,
              "Special features": robot.features.join(", "),
            }).map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
            {robot.performance.map((p) => (
              <div key={p.label}>
                <dt>{p.label}</dt>
                <dd>{p.value}</dd>
              </div>
            ))}
          </dl>
          {team && (
            <Link className="text-link" href={`/teams/${team.slug}`}>
              Meet {team.name} ↗
            </Link>
          )}
        </div>
      </section>
    </>
  );
}
