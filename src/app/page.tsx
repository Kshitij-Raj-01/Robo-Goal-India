import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDown,
  Flag,
  Target,
  Zap,
  MoveUpRight,
  GraduationCap,
  Check,
} from "lucide-react";
import { Button, Eyebrow, SectionHead } from "@/components/ui";
import {
  statistics,
  hostingBenefits,
  site,
  partners,
  sponsors,
} from "@/lib/content";
import {
  TourJourney,
  FixtureMap,
  EventBrowser,
  GalleryBrowser,
  Leaderboard,
  Stats,
  HeroAtmosphere,
} from "@/components/experience";
import { Intro, IntroReplay } from "@/components/intro";
export default function Home() {
  return (
    <>
      <Intro />
      <section className="hero">
        <Image
          src="/images/stadium.webp"
          alt="Concept artwork of engineered soccer and racing robots in a floodlit stadium"
          fill
          priority
          sizes="100vw"
          className="hero-image"
        />
        <div className="hero-shade" />
        <div className="hero-grid" />
        <HeroAtmosphere />
        <div className="hero-content container">
          <Eyebrow>INDIA’S ROBOTIC SPORTS LEAGUE</Eyebrow>
          <h1>
            BUILD.
            <br />
            COMPETE.
            <br />
            <em>CONQUER.</em>
          </h1>
          <p>
            Robo Goal India brings students, schools, universities and
            technology communities together through high-energy robotic soccer
            and racing competitions across India.
          </p>
          <div className="button-row">
            <Button href="/tour">Explore the Tour</Button>
            <Button href="/collaborate?type=Host+a+Campus+Round" secondary>
              Host a Campus Round
            </Button>
          </div>
          <div className="hero-disciplines">
            <span>
              <Target size={14} /> ROBO SOCCER
            </span>
            <i />
            <span>
              <Zap size={14} /> ROBO RACE
            </span>
            <i />
            <span>ONE NATIONAL STAGE</span>
          </div>
        </div>
        <div className="hero-scoreboard">
          <div>
            <span className="live-dot" /> THE FUTURE IS IN PLAY
          </div>
          <strong>
            ENGINEERING <span>×</span> SPORT
          </strong>
          <small>CAMPUS → CITY → NATIONAL</small>
        </div>
        <div className="hero-bottom container">
          <span>DESIGNED TO COMPETE. BUILT TO INSPIRE.</span>
          <a href="#arena">
            SCROLL TO EXPLORE <ArrowDown size={14} />
          </a>
          <IntroReplay />
        </div>
      </section>
      <div className="broadcast-strip">
        <span>THE NEXT GENERATION PLAYS DIFFERENT.</span>
        <span>
          BUILD YOUR ROBOT <b>✦</b> FIND YOUR TEAM <b>✦</b> OWN THE ARENA{" "}
          <b>✦</b> REPRESENT YOUR CAMPUS
        </span>
        <ArrowUpRight size={20} />
      </div>
      <section className="stats-band">
        <div className="container">
          <Stats items={statistics} />
        </div>
      </section>
      <section className="section container" id="arena">
        <SectionHead
          number="01"
          title="THIS ISN’T JUST A GAME."
          accent="IT’S YOUR NEXT MOVE."
          description="Robo Goal India brings students, schools, universities and technology communities together through high-energy robotic soccer and racing competitions across India."
        />
        <div className="discipline-grid">
          <Link href="/tour#soccer" className="discipline soccer">
            <div className="discipline-photo" />
            <span className="micro">01 / PRECISION. STRATEGY. TEAMWORK.</span>
            <div>
              <Target size={30} />
              <h3>
                ROBO
                <br />
                SOCCER<span>↗</span>
              </h3>
              <p>
                Build your squad. Control the pitch.
                <br />
                Turn engineering into match-winning moments.
              </p>
            </div>
            <span className="card-bottom">
              THE BEAUTIFUL GAME. RE-ENGINEERED. <ArrowUpRight size={18} />
            </span>
          </Link>
          <Link href="/tour#race" className="discipline race">
            <div className="race-track" />
            <span className="micro">02 / SPEED. CONTROL. INNOVATION.</span>
            <div>
              <Zap size={30} />
              <h3>
                ROBO
                <br />
                RACE<span>↗</span>
              </h3>
              <p>
                Design for speed. Engineer for control.
                <br />
                Every turn is a test of what you’ve built.
              </p>
            </div>
            <span className="card-bottom">
              BUILT FAST. DRIVEN SMART. <ArrowUpRight size={18} />
            </span>
          </Link>
        </div>
      </section>
      <section className="section journey-section">
        <div className="container">
          <SectionHead
            number="02"
            title="START ON CAMPUS."
            accent="AIM FOR INDIA."
            description="A bigger stage at every step. Follow the proposed journey from your first campus round to a future national league."
            href="/tour"
            link="Discover the format"
          />
          <TourJourney compact />
        </div>
      </section>
      <section className="section container">
        <SectionHead
          number="03"
          title="A NATION."
          accent="ONE CONNECTED ARENA."
          description="Follow the tour as official cities and rounds are announced."
          href="/fixtures"
          link="All fixtures"
        />
        <FixtureMap compact />
      </section>
      <section className="campus-section">
        <div className="container campus-inner">
          <div>
            <Eyebrow>CALLING SCHOOLS, COLLEGES & UNIVERSITIES</Eyebrow>
            <h2>
              YOUR CAMPUS.
              <br />
              THE NEXT <em>ARENA.</em>
            </h2>
            <p>
              Bring Robo Goal India to your campus. Give your students a reason
              to build, a team to believe in and a stage to shine.
            </p>
            <Button href="/collaborate?type=Host+a+Campus+Round">
              Host a Campus Round
            </Button>
          </div>
          <div className="campus-benefits">
            <GraduationCap size={46} strokeWidth={1} />
            <h3>
              More than an event.
              <br />A culture of innovation.
            </h3>
            {hostingBenefits.slice(0, 4).map((b) => (
              <p key={b}>
                <Check size={16} />
                {b}
              </p>
            ))}
            <Link href="/collaborate" className="text-link">
              Explore institutional collaboration <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>
      <section className="section container">
        <SectionHead
          number="04"
          title="FROM THE"
          accent="ARENA."
          description="The rounds, the rivalries and the moments that move us forward."
          href="/events"
          link="Explore events"
        />
        <EventBrowser compact />
      </section>
      <section className="section container leaderboard-section">
        <SectionHead
          number="05"
          title="BUILT TO CLIMB."
          accent="EARN YOUR RANK."
          description="Every match matters. Follow team standings when official results are published."
          href="/leaderboard"
          link="Full leaderboard"
        />
        <Leaderboard />
      </section>
      <section className="organizer-section container">
        <div className="organizer-art">
          <span className="circuit-ring" />
          <span className="large-rs">
            RS<sup>↗</sup>
          </span>
          <span className="micro">IDEAS → ENGINEERING → IMPACT</span>
        </div>
        <div>
          <Eyebrow>THE PEOPLE BEHIND THE PLAY</Eyebrow>
          <h2>
            POWERED BY
            <br />
            PRACTICAL <em>LEARNING.</em>
          </h2>
          <p>
            Organized by Robotic Sir AI India Pvt. Ltd., connecting robotics,
            electronics and artificial intelligence with practical technology
            education, workshops, competitions and new-age learning programs.
          </p>
          <a
            href={site.parentUrl}
            className="text-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit Robotic Sir <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
      <section className="section container">
        <SectionHead
          number="06"
          title="REAL TEAMS."
          accent="UNFORGETTABLE MOMENTS."
          href="/gallery"
          link="Enter the gallery"
        />
        <GalleryBrowser compact />
      </section>
      <section className="section container partnership-section">
        <SectionHead
          number="07"
          title="INSTITUTIONS. BRANDS. BELIEVERS."
          accent="BUILDING WHAT COMES NEXT."
          description="Institutions shaping the future of practical learning, and partners helping bring robotic sports to a national stage."
        />
        <div className="content-grid">
          <div className="partner-preview">
            <GraduationCap size={30} />
            <h3>NEW-AGE LEARNING PARTNERS</h3>
            <p>
              Participating institutions connect practical STEM learning with a
              structured competition journey.
            </p>
            {partners.length ? (
              <div className="logo-grid">
                {partners.slice(0, 3).map((p) => (
                  <Link href="/partners" key={p.id}>
                    <Image
                      src={p.logo}
                      width={200}
                      height={100}
                      alt={`${p.name} logo`}
                      style={{ objectFit: "contain" }}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <span className="micro">
                Partner institution announcements coming soon
              </span>
            )}
            <Link href="/partners" className="text-link">
              Meet our learning community <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="partner-preview">
            <Flag size={30} />
            <h3>PARTNERS IN POSSIBILITY</h3>
            <p>
              From technology and equipment to education and media, find a
              partnership that fits your organization.
            </p>
            {sponsors.length ? (
              <div className="logo-grid">
                {sponsors.slice(0, 3).map((s) => (
                  <Link href="/sponsors" key={s.id}>
                    <Image
                      src={s.logo}
                      width={200}
                      height={100}
                      alt={`${s.name} logo`}
                      style={{ objectFit: "contain" }}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <span className="micro">
                Official sponsor announcements coming soon
              </span>
            )}
            <Link href="/sponsors" className="text-link">
              Explore partnership tiers <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>
      <section className="closing-cta container">
        <div>
          <Eyebrow>BUILD THE FUTURE WITH US</Eyebrow>
          <h2>
            GREAT TEAMS NEED
            <br />
            <em>GREAT PARTNERS.</em>
          </h2>
          <p>
            Host a round. Back an idea. Help shape the future of robotic sports.
          </p>
        </div>
        <div className="button-stack">
          <Button href="/collaborate?type=Competition+Sponsorship">
            Become a Sponsor
          </Button>
          <Button href="/contact" secondary>
            Let’s Talk <MoveUpRight size={16} />
          </Button>
        </div>
      </section>
      <section className="container home-contact">
        <div>
          <Eyebrow>CONTACT THE ORGANIZER</Eyebrow>
          <h3>YOUR NEXT MOVE STARTS WITH A HELLO.</h3>
          <p>{site.organizer}</p>
        </div>
        <div>
          <span className="micro">OFFICIAL EMAIL</span>
          <p>
            {site.email ? (
              <a href={`mailto:${site.email}`}>{site.email}</a>
            ) : (
              "To be announced"
            )}
          </p>
          <span className="micro">OFFICIAL CONTACT NUMBER</span>
          <p>
            {site.phone ? (
              <a href={`tel:${site.phone}`}>{site.phone}</a>
            ) : (
              "To be announced"
            )}
          </p>
        </div>
        <Button href="/contact" secondary>
          Contact Us
        </Button>
      </section>
    </>
  );
}
