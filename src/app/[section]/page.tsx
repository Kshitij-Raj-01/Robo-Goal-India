import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Bot,
  Check,
  GraduationCap,
  Handshake,
  Target,
  Zap,
} from "lucide-react";
import {
  PageHero,
  Button,
  Eyebrow,
  EmptyState,
  SectionHead,
} from "@/components/ui";
import {
  TourJourney,
  FixtureMap,
  EventBrowser,
  GalleryBrowser,
  Leaderboard,
} from "@/components/experience";
import {
  skills,
  site,
  partners,
  sponsors,
  sponsorTiers,
  hostingBenefits,
  teams,
  robots,
} from "@/lib/content";
const pages: Record<
  string,
  { title: string; accent: string; description: string }
> = {
  about: {
    title: "WHERE ROBOTICS MEETS",
    accent: "THE ENERGY OF SPORT.",
    description:
      "A national robotic sports initiative turning curiosity into competition, and practical learning into unforgettable experiences.",
  },
  tour: {
    title: "FROM YOUR CAMPUS.",
    accent: "TO THE NATIONAL STAGE.",
    description:
      "Five stages. Two disciplines. One shared ambition. Explore the proposed pathway toward the future Robo Goal India National League.",
  },
  events: {
    title: "THE ROUNDS.",
    accent: "THE STORIES. THE RESULTS.",
    description:
      "Explore official competitions, campus rounds and the teams behind them. Every published result belongs to a real event.",
  },
  fixtures: {
    title: "FIND YOUR CITY.",
    accent: "MEET YOUR NEXT CHALLENGE.",
    description:
      "Your official guide to confirmed cities, venues and competition dates. Stay ready for the next announcement.",
  },
  gallery: {
    title: "INSIDE",
    accent: "THE ARENA.",
    description:
      "Real robots. Real people. Real moments. Explore photographs and video highlights from official Robo Goal India events.",
  },
  partners: {
    title: "PRACTICAL LEARNING.",
    accent: "SHARED AMBITION.",
    description:
      "Institutions shaping the future of practical learning. Together, we give students the space, support and stage to build what comes next.",
  },
  sponsors: {
    title: "BACK THE BUILDERS.",
    accent: "POWER THE POSSIBILITIES.",
    description:
      "Connect your brand with practical technology education and a growing robotic sports community.",
  },
  leaderboard: {
    title: "EVERY MATCH COUNTS.",
    accent: "EVERY POINT IS EARNED.",
    description:
      "The official home of team standings, match statistics and qualification status. Rankings are published only from verified results.",
  },
  teams: {
    title: "MEET THE",
    accent: "NEXT GENERATION.",
    description:
      "Discover the students, institutions and engineering ideas behind Robo Goal India teams.",
  },
  robots: {
    title: "BUILT TO PLAY.",
    accent: "ENGINEERED TO COMPETE.",
    description:
      "Explore the machines behind the matches: their controllers, drive systems, design choices and competition performance.",
  },
};
export const dynamicParams = false;
export function generateStaticParams() {
  return Object.keys(pages).map((section) => ({ section }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section } = await params;
  const p = pages[section];
  return {
    title: p ? `${p.title} ${p.accent}` : "Page not found",
    description: p?.description,
    alternates: { canonical: `/${section}` },
  };
}
export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const page = pages[section];
  if (!page) notFound();
  return (
    <>
      <PageHero eyebrow={`ROBO GOAL INDIA / ${section}`} {...page} />
      {section === "about" && (
        <>
          <section className="section container content-grid">
            <div className="prose">
              <Eyebrow>LEARN BY BUILDING. GROW BY PLAYING.</Eyebrow>
              <h2>
                A NEW KIND OF
                <br />
                <em>PLAYING FIELD.</em>
              </h2>
              <p>
                Robo Goal India brings schools, universities and technology
                communities together through robotic soccer and Robo Race.
                Students design and build their machines, then put their
                engineering decisions to the test in the arena.
              </p>
              <p>
                On the pitch, strategy and teamwork matter as much as
                electronics. On the track, mechanical design meets programming
                and split-second problem-solving. Every challenge becomes a
                reason to learn something new.
              </p>
              <div className="tag-list">
                {skills.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
              <Button href="/tour">Discover the Competition Journey</Button>
            </div>
            <div>
              <div className="feature-image">
                <Image
                  src="/images/robo-goal-event.webp"
                  fill
                  sizes="(max-width:700px) 90vw, 45vw"
                  alt="Real student-built soccer robots competing on the Robo Goal India pitch"
                />
              </div>
              <p className="caption">
                From the Robo Goal India event · Student-built competition
                robots
              </p>
            </div>
          </section>
          <section className="section container prose">
            <SectionHead
              number="01"
              title="POWERED BY PRACTICAL LEARNING."
              accent="ORGANIZED BY ROBOTIC SIR."
            />
            <p>
              {site.organizer} is the parent company and organizer of Robo Goal
              India. Its work spans robotics, electronics, artificial
              intelligence, practical technology education, competitions,
              workshops and new-age learning programs.
            </p>
            <p>
              Robo Goal India extends that practical learning approach into a
              structured sporting journey: campus rounds, city qualifiers,
              regional rounds and a proposed national competition pathway.
            </p>
            <a
              className="button"
              href={site.parentUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit Robotic Sir ↗
            </a>
          </section>
        </>
      )}
      {section === "tour" && (
        <>
          <section className="section container">
            <TourJourney />
            <p className="caption">
              Proposed competition pathway. Final eligibility, team counts and
              qualification rules will be published with official round
              announcements.
            </p>
          </section>
          <section className="section container info-grid">
            <article className="info-card" id="soccer">
              <Target size={35} />
              <h3>ROBO SOCCER</h3>
              <p>
                Combine robot control, mechanical design and tactical thinking
                on a football pitch. Teams work together to turn engineering
                into goals.
              </p>
              <Link className="text-link" href="/documents/rules">
                Official competition rules ↗
              </Link>
            </article>
            <article className="info-card" id="race">
              <Zap size={35} />
              <h3>ROBO RACE</h3>
              <p>
                Balance speed, stability and control. Build a machine that can
                translate a smart design into consistent track performance.
              </p>
              <Link className="text-link" href="/documents/rules">
                Technical rules and specifications ↗
              </Link>
            </article>
            <article className="info-card">
              <GraduationCap size={35} />
              <h3>START AT YOUR CAMPUS</h3>
              <p>
                Bring students together around a shared engineering challenge
                and open a pathway to city, regional and national competition.
              </p>
              <Link
                className="text-link"
                href="/collaborate?type=Host+a+Campus+Round"
              >
                Host a Campus Round ↗
              </Link>
            </article>
          </section>
        </>
      )}
      {section === "events" && (
        <section className="section container">
          <EventBrowser />
        </section>
      )}
      {section === "fixtures" && (
        <section className="section container">
          <FixtureMap />
        </section>
      )}
      {section === "gallery" && (
        <section className="section container">
          <GalleryBrowser />
        </section>
      )}
      {section === "leaderboard" && (
        <section className="section container">
          <Leaderboard />
          <p className="caption">
            Official standings will follow published competition rules. The data
            model supports future live-result integration.
          </p>
        </section>
      )}
      {section === "partners" && (
        <>
          <section className="section container">
            <SectionHead
              number="01"
              title="INSTITUTIONS SHAPING"
              accent="THE FUTURE OF PRACTICAL LEARNING."
              description="Our New-Age Learning Initiative connects classroom curiosity with hands-on experiences in robotics, engineering and team competition."
            />
            {partners.length ? (
              <div className="logo-grid">
                {partners.map((p) => (
                  <article className="logo-card" key={p.id}>
                    <Image
                      src={p.logo}
                      alt={`${p.name} logo`}
                      width={250}
                      height={130}
                    />
                    <h3>{p.name}</h3>
                    <p>
                      {p.city} · {p.type}
                      <br />
                      Round hosted: {p.roundHosted}
                    </p>
                    <a
                      className="text-link"
                      href={p.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit institution ↗
                    </a>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title="A place for forward-thinking institutions."
                description="Confirmed partner institutions and hosted rounds will be announced here. Your institution could help shape the next chapter."
                href="/collaborate?type=Institutional+Collaboration"
                action="Become a learning partner"
              />
            )}
          </section>
          <section className="section container content-grid">
            <div className="prose">
              <h2>
                BRING ROBO GOAL INDIA
                <br />
                <em>TO YOUR CAMPUS.</em>
              </h2>
              <p>
                Give students the opportunity to design, experiment and compete
                through a structured robotics league.
              </p>
              <Button href="/collaborate?type=Host+a+Campus+Round">
                Host a Campus Round
              </Button>
            </div>
            <ul className="benefits-list">
              {hostingBenefits.map((b) => (
                <li key={b}>
                  <Check size={17} />
                  {b}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
      {section === "sponsors" && (
        <section className="section container">
          <SectionHead
            number="01"
            title="A ROLE FOR EVERY PARTNER."
            accent="AN IMPACT THAT LASTS."
          />
          {sponsors.length ? (
            <div className="logo-grid">
              {sponsors.map((s) => (
                <article className="logo-card" key={s.id}>
                  <span className="micro">{s.tier}</span>
                  <Image
                    src={s.logo}
                    alt={`${s.name} logo`}
                    width={250}
                    height={130}
                  />
                  <h3>{s.name}</h3>
                  <p>{s.description}</p>
                  <a
                    className="text-link"
                    href={s.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit partner ↗
                  </a>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="The next chapter needs partners."
              description="Sponsor announcements will appear after partnerships are confirmed. Explore the ways your organization can contribute."
            />
          )}
          <div className="tier-grid">
            {sponsorTiers.map((tier, i) => (
              <div key={tier}>
                <span className="micro">
                  PARTNERSHIP / {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{tier}</h3>
              </div>
            ))}
          </div>
          <Button href="/collaborate?type=Competition+Sponsorship">
            Become a Sponsor
          </Button>
        </section>
      )}
      {section === "teams" && (
        <section className="section container">
          {teams.length ? (
            <div className="event-grid">
              {teams.map((t) => (
                <Link
                  className="info-card"
                  href={`/teams/${t.slug}`}
                  key={t.id}
                >
                  {t.image && (
                    <Image
                      src={t.image}
                      alt={t.name}
                      width={600}
                      height={400}
                    />
                  )}
                  <h3>{t.name}</h3>
                  <p>
                    {t.institution} · {t.city}
                  </p>
                  <span className="text-link">Meet the team ↗</span>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Your team. Your story. Your stage."
              description="Official team profiles will be published after registration and verification."
              href="/contact?type=Team+Registration"
              action="Ask about team registration"
            />
          )}
          <div className="button-row" style={{ marginTop: 30 }}>
            <Button href="/robots" secondary>
              Explore Robot Profiles
            </Button>
            <Button href="/leaderboard" secondary>
              Team Standings
            </Button>
          </div>
        </section>
      )}
      {section === "robots" && (
        <section className="section container">
          {robots.length ? (
            <div className="event-grid">
              {robots.map((r) => (
                <Link
                  className="info-card"
                  href={`/robots/${r.slug}`}
                  key={r.slug}
                >
                  <Bot size={30} />
                  <h3>{r.name}</h3>
                  <p>
                    {r.controller} · {r.motors}
                  </p>
                  <span className="text-link">Robot specifications ↗</span>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="The machines are still in the making."
              description="Verified robot profiles, technical specifications and performance statistics will appear here."
              href="/teams"
              action="Explore teams"
            />
          )}
        </section>
      )}
      {["partners", "about", "sponsors"].includes(section) && (
        <section className="closing-cta container">
          <div>
            <Eyebrow>LET’S BUILD SOMETHING THAT MATTERS</Eyebrow>
            <h2>
              YOUR IDEAS.
              <br />
              <em>OUR NEXT CHAPTER.</em>
            </h2>
          </div>
          <Button href="/collaborate">Collaborate With Us</Button>
        </section>
      )}
    </>
  );
}
