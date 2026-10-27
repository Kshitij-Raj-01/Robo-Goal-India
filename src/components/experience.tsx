"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  MapPin,
  CalendarDays,
  Flag,
  Trophy,
  ChevronRight,
  Bot,
  X,
  Navigation,
  Clock,
  Images,
} from "lucide-react";
import {
  events,
  fixtures,
  media,
  stages,
  teams,
  galleryCategories,
  announcements,
  type Media,
  type Team,
} from "@/lib/content";
import { EmptyState, Button } from "./ui";
import { useContent } from "./content-provider";

export function HeroAtmosphere() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      node.querySelectorAll<HTMLElement>("[data-motion]").forEach((el) => {
        el.style.animationPlayState = entry.isIntersecting
          ? "running"
          : "paused";
      });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="hero-atmosphere" ref={ref} aria-hidden="true">
      <span className="stadium-beam" data-motion />
      <span className="stadium-beam blue" data-motion />
      <span className="animated-pitch" data-motion />
    </div>
  );
}

function RouteRobot() {
  const { fixtures } = useContent();
  const ref = useRef<SVGGElement>(null);
  useEffect(() => {
    if (
      fixtures.length < 2 ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    let dispose = () => {};
    let stopped = false;
    import("gsap").then(({ gsap }) => {
      if (stopped || !ref.current) return;
      const point = { x: fixtures[0].x, y: fixtures[0].y };
      const timeline = gsap.timeline({
        repeat: -1,
        repeatDelay: 1,
        paused: true,
      });
      for (const city of fixtures.slice(1)) {
        timeline.to(point, {
          x: city.x,
          y: city.y,
          duration: 2,
          ease: "power1.inOut",
          onUpdate: () =>
            ref.current?.setAttribute(
              "transform",
              `translate(${point.x} ${point.y})`,
            ),
        });
      }
      const observer = new IntersectionObserver(([entry]) =>
        entry.isIntersecting ? timeline.resume() : timeline.pause(),
      );
      observer.observe(ref.current.ownerSVGElement!);
      dispose = () => {
        timeline.kill();
        observer.disconnect();
      };
    });
    return () => {
      stopped = true;
      dispose();
    };
  }, []);
  if (fixtures.length < 2) return null;
  return (
    <g
      ref={ref}
      transform={`translate(${fixtures[0].x} ${fixtures[0].y})`}
      aria-hidden="true"
    >
      <rect
        x="-12"
        y="-10"
        width="24"
        height="20"
        rx="3"
        fill="#ff6929"
        stroke="#d4e4ef"
      />
      <path d="M-15-8v5m0 6v5M15-8v5m0 6v5" stroke="#b6cbd5" strokeWidth="4" />
      <rect x="-6" y="-5" width="12" height="10" fill="#092139" />
      <circle cy="-2" r="2" fill="#63d8f4" />
    </g>
  );
}

export function Stats({
  items,
}: {
  items: { label: string; value: number | null }[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let dispose = () => {};
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(async (entries) => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      const { gsap } = await import("gsap");
      const ctx = gsap.context(() => {
        ref.current
          ?.querySelectorAll<HTMLElement>("[data-value]")
          .forEach((el) => {
            const counter = { value: 0 };
            gsap.to(counter, {
              value: Number(el.dataset.value),
              duration: 1.4,
              ease: "power2.out",
              onUpdate: () => {
                el.textContent = Math.round(counter.value).toLocaleString(
                  "en-IN",
                );
              },
            });
          });
      }, ref);
      dispose = () => ctx.revert();
    });
    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
      dispose();
    };
  }, []);
  return (
    <div className="stats" ref={ref}>
      {items.map((s) => (
        <div key={s.label}>
          <strong {...(s.value !== null ? { "data-value": s.value } : {})}>
            {s.value === null ? (
              <span className="pending-stat">
                —<small>COMING INTO PLAY</small>
              </span>
            ) : (
              s.value.toLocaleString("en-IN")
            )}
          </strong>
          <span>{s.label}</span>
        </div>
      ))}
    </div>
  );
}
export function TourJourney({ compact = false }: { compact?: boolean }) {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const robot = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cleanup = () => {};
    let disposed = false;
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (disposed) return;
        gsap.registerPlugin(ScrollTrigger);
        const ctx = gsap.context(() => {
          gsap.to(robot.current, {
            x: () =>
              window.innerWidth < 700
                ? 0
                : (ref.current?.offsetWidth || 0) - 48,
            y: () => (window.innerWidth < 700 ? 300 : 0),
            ease: "none",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 75%",
              end: "bottom 30%",
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });
        }, ref);
        cleanup = () => ctx.revert();
      },
    );
    return () => {
      disposed = true;
      cleanup();
    };
  }, []);
  return (
    <div className={`journey ${compact ? "compact" : ""}`} ref={ref}>
      <div className="journey-track" />
      <div className="journey-robot" ref={robot} aria-hidden="true">
        <Bot size={25} />
      </div>
      <div
        className="journey-stages"
        role="tablist"
        aria-label="Competition stages"
      >
        {stages.map((stage, i) => (
          <button
            role="tab"
            aria-selected={active === i}
            aria-controls="stage-detail"
            id={`stage-${i}`}
            tabIndex={active === i ? 0 : -1}
            onKeyDown={(e) => {
              if (
                [
                  "ArrowRight",
                  "ArrowDown",
                  "ArrowLeft",
                  "ArrowUp",
                  "Home",
                  "End",
                ].includes(e.key)
              ) {
                e.preventDefault();
                const n =
                  e.key === "Home"
                    ? 0
                    : e.key === "End"
                      ? 4
                      : (active +
                          (["ArrowRight", "ArrowDown"].includes(e.key)
                            ? 1
                            : 4)) %
                        5;
                setActive(n);
                document.getElementById(`stage-${n}`)?.focus();
              }
            }}
            onClick={() => setActive(i)}
            className={active === i ? "active" : ""}
            key={stage.name}
          >
            <span className="stage-number">
              0{i + 1}
              {i === 4 ? <Trophy size={18} /> : <Flag size={18} />}
            </span>
            <h3>{stage.name}</h3>
            <span>
              {i === 4 ? "THE FUTURE VISION" : "THE JOURNEY CONTINUES"}
            </span>
          </button>
        ))}
      </div>
      <div
        id="stage-detail"
        className="stage-detail"
        role="tabpanel"
        aria-labelledby={`stage-${active}`}
      >
        <div>
          <span className="micro">
            STAGE 0{active + 1} /{" "}
            {active === 4 ? "FUTURE LEAGUE" : "COMPETITION PATHWAY"}
          </span>
          <h3>{stages[active].short}</h3>
          <p>{stages[active].description}</p>
        </div>
        {!compact ? (
          <dl className="stage-specs">
            {Object.entries({
              Eligibility: stages[active].eligibility,
              "Expected teams": stages[active].teams,
              "Qualification process": stages[active].qualification,
              "Venue type": stages[active].venue,
              "Advancement criteria": stages[active].advancement,
            }).map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <Link className="text-link" href="/tour">
            See the full journey <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </div>
  );
}
export function FixtureMap({ compact = false }: { compact?: boolean }) {
  const { fixtures } = useContent();
  const [selected, setSelected] = useState<string | null>(null);
  const f =
    fixtures.find((f) => f.id === selected) ||
    fixtures.find((f) => f.status === "Current") ||
    fixtures[0];
  return (
    <div className="fixture-module">
      <div className="map-panel">
        <div className="map-top">
          <span className="micro">INDIA / TOUR RADAR</span>
          <span className="micro cyan">● NETWORK READY</span>
        </div>
        <svg
          viewBox="0 0 600 590"
          role="img"
          aria-label="India map supplied by the organizer, including state boundaries; city announcements appear in the fixture list"
          className="india-map"
        >
          <defs>
            <filter id="organizer-map-ink" colorInterpolationFilters="sRGB">
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.10  0 0 0 0 0.49  0 0 0 0 0.69  -0.3333 -0.3333 -0.3333 0 1"
              />
            </filter>
          </defs>
          <g opacity=".22" stroke="#315267" fill="none">
            <ellipse cx="290" cy="305" rx="240" ry="220" />
            <ellipse cx="290" cy="305" rx="180" ry="165" />
            <path d="M50 305H550M290 60V555" />
          </g>
          <image
            href="/maps/india-organizer.png"
            x="-160"
            y="-20"
            width="900"
            height="643"
            filter="url(#organizer-map-ink)"
          />
          {fixtures.length > 1 && (
            <path
              id="city-route"
              d={fixtures
                .map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y}`)
                .join(" ")}
              stroke="#ff6324"
              strokeDasharray="5 7"
              fill="none"
              className="map-route"
            />
          )}
          {fixtures.map((p) => (
            <g
              key={p.id}
              className={`map-city ${p.status.toLowerCase().replaceAll(" ", "-")}`}
            >
              <circle cx={p.x} cy={p.y} r="7" />
              <text x={p.x + 14} y={p.y + 4}>
                {p.city}
              </text>
            </g>
          ))}
          <RouteRobot />
        </svg>
        <span className="map-disclaimer">
          India map supplied by the organizer · Cities announced after
          confirmation
        </span>
        <div className="map-legend">
          {["Completed", "Current", "Upcoming", "To be announced"].map((s) => (
            <span key={s} className={s.toLowerCase().replaceAll(" ", "-")}>
              <i />
              {s}
            </span>
          ))}
        </div>
      </div>
      <div className="fixture-announcement">
        <span className="micro">THE ROAD TO THE NATIONAL STAGE</span>
        <h3>
          {announcements[0]?.heading || (
            <>
              NEXT STOP.
              <br />
              <em>YOUR CITY?</em>
            </>
          )}
        </h3>
        <p>
          {announcements[0]?.description ||
            "A new arena. A new generation of contenders. Official cities, venues and dates will be announced here."}
        </p>
        {f ? (
          <>
            <span className="status-tag">{f.status}</span>
            <h4>{f.city}</h4>
            <p>
              <MapPin size={16} /> {f.venue}
            </p>
            <Countdown date={f.date} />
          </>
        ) : (
          <div className="announcement-status">
            <CalendarDays size={22} />
            <div>
              <b>TOUR ANNOUNCEMENTS COMING SOON</b>
              <span>Dates and cities awaiting confirmation</span>
            </div>
          </div>
        )}
        <Button href="/collaborate?type=Host+a+City+or+Regional+Round">
          Bring the Tour to Your City
        </Button>
      </div>
      {!compact && (
        <div className="fixture-list">
          <h3>Official fixtures</h3>
          {fixtures.length ? (
            fixtures.map((item) => (
              <article key={item.id} className="fixture-row">
                <button
                  onClick={() => setSelected(item.id)}
                  className="fixture-city"
                >
                  <MapPin />
                  <span>
                    <strong>{item.city}</strong>
                    <small>{item.venue}</small>
                  </span>
                </button>
                <div>
                  <span className="status-tag">
                    {item.status} · {item.stage}
                  </span>
                  <p>
                    {item.date
                      ? new Date(item.date).toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          dateStyle: "medium",
                          timeStyle: "short",
                        }) + " IST"
                      : "Date to be announced"}
                  </p>
                  <Countdown date={item.date} />
                </div>
                <div>
                  <p>Registration: {item.registrationStatus}</p>
                  {item.registrationStatus === "Open" &&
                    item.registrationUrl && (
                      <a className="text-link" href={item.registrationUrl}>
                        Register <ArrowUpRight size={16} />
                      </a>
                    )}
                  {item.directionsUrl && (
                    <a
                      className="text-link"
                      href={item.directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Directions <Navigation size={16} />
                    </a>
                  )}
                </div>
              </article>
            ))
          ) : (
            <EmptyState
              title="The fixture board is warming up."
              description="Confirmed dates, venues, registration links and directions will appear here. No rounds have been announced yet."
            />
          )}
        </div>
      )}
    </div>
  );
}
export function Countdown({ date }: { date: string | null }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    if (!date) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [date]);
  if (!date) return <span className="countdown">DATE TO BE ANNOUNCED</span>;
  if (now === null)
    return <span className="countdown">SYNCING COUNTDOWN…</span>;
  const diff = Math.max(0, new Date(date).getTime() - now);
  if (!diff) return <span className="countdown">SCHEDULED START REACHED</span>;
  return (
    <span className="countdown">
      <Clock size={14} /> {Math.floor(diff / 86400000)}D :{" "}
      {Math.floor(diff / 3600000) % 24}H : {Math.floor(diff / 60000) % 60}M :{" "}
      {Math.floor(diff / 1000) % 60}S
    </span>
  );
}
export function EventBrowser({ compact = false }: { compact?: boolean }) {
  const { events } = useContent();
  const [filters, setFilters] = useState({
    year: "All years",
    city: "All cities",
    type: "All formats",
    status: "All statuses",
  });
  const list = events.filter(
    (e) =>
      (filters.year === "All years" || e.date.slice(0, 4) === filters.year) &&
      (filters.city === "All cities" || e.city === filters.city) &&
      (filters.type === "All formats" || e.type === filters.type) &&
      (filters.status === "All statuses" || e.status === filters.status),
  );
  return (
    <div>
      {!compact && (
        <div className="filter-bar">
          {(
            [
              [
                "year",
                [
                  "All years",
                  ...new Set(events.map((e) => e.date.slice(0, 4))),
                ],
              ],
              ["city", ["All cities", ...new Set(events.map((e) => e.city))]],
              [
                "type",
                ["All formats", "Robo Soccer", "Robo Race", "Campus Round"],
              ],
              ["status", ["All statuses", "Completed", "Upcoming"]],
            ] as [keyof typeof filters, string[]][]
          ).map(([k, values]) => (
            <label key={k}>
              <span>{k}</span>
              <select
                value={filters[k]}
                onChange={(e) =>
                  setFilters({ ...filters, [k]: e.target.value })
                }
              >
                {values.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
          ))}
          <span className="micro">{list.length} EVENTS</span>
          <button
            className="text-link"
            onClick={() =>
              setFilters({
                year: "All years",
                city: "All cities",
                type: "All formats",
                status: "All statuses",
              })
            }
          >
            Reset filters
          </button>
        </div>
      )}
      {list.length ? (
        <div className="event-grid">
          {list.slice(0, compact ? 3 : undefined).map((e) => (
            <Link
              href={`/events/${e.slug}`}
              key={e.slug}
              className="event-card"
            >
              {e.cover && (
                <Image
                  src={e.cover}
                  unoptimized={e.cover.startsWith("/media/")}
                  width={700}
                  height={450}
                  alt={e.title}
                  sizes="(max-width: 700px) 100vw, 33vw"
                />
              )}
              <div>
                <span className="status-tag">
                  {e.status} / {e.type}
                </span>
                <h3>{e.title}</h3>
                <p>
                  <MapPin size={15} />
                  {e.city} · {e.venue}
                </p>
                <p>
                  {new Date(e.date).toLocaleDateString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    dateStyle: "long",
                  })}
                </p>
                <span className="text-link">
                  Event details <ArrowUpRight size={16} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="event-empty">
          <div className="event-empty-icon">
            <Flag size={52} strokeWidth={1} />
            <span>READY FOR KICK-OFF</span>
          </div>
          <div>
            <span className="micro">
              {events.length ? "NO MATCHES" : "OFFICIAL EVENT ARCHIVE"}
            </span>
            <h3>
              {events.length
                ? "No events match these filters."
                : "Every great league starts with a first whistle."}
            </h3>
            <p>
              {events.length
                ? "Try another city, year or format."
                : "Verified event stories, real photographs and official results will be published here. Be part of what comes next."}
            </p>
            <Link
              href="/collaborate?type=Host+a+Campus+Round"
              className="text-link"
            >
              Host a round <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
export function GalleryBrowser({ compact = false }: { compact?: boolean }) {
  const { media } = useContent();
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<Media | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const list = media.filter((m) => filter === "All" || m.category === filter);
  useEffect(() => {
    if (selected) dialog.current?.showModal();
    else dialog.current?.close();
  }, [selected]);
  return (
    <div>
      {!compact && (
        <div className="tabs" role="group" aria-label="Gallery categories">
          {["All", ...galleryCategories].map((c) => (
            <button
              key={c}
              aria-pressed={filter === c}
              className={filter === c ? "active" : ""}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}
      {list.length ? (
        <div className="masonry">
          {list.slice(0, compact ? 4 : undefined).map((m) => (
            <button
              key={m.id}
              className="gallery-tile"
              onClick={() => setSelected(m)}
            >
              {m.type === "image" ? (
                <Image
                  src={m.src}
                  unoptimized={m.src.startsWith("/media/")}
                  width={m.width}
                  height={m.height}
                  alt={m.alt}
                  sizes="(max-width:700px) 90vw, 33vw"
                />
              ) : (
                <div className="video-tile">
                  <Images />
                  <span>Play video highlight</span>
                </div>
              )}
              <span>
                {m.caption}
                <ArrowUpRight size={17} />
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="gallery-empty">
          <Images size={34} strokeWidth={1} />
          <div>
            <h3>THE MOMENTS WILL BE REAL.</h3>
            <p>
              Our gallery is reserved for genuine event photographs and
              highlights.{" "}
              {filter === "All"
                ? "Official media will appear here after publication."
                : `No ${filter.toLowerCase()} media has been published yet.`}
            </p>
          </div>
          <span className="status-tag">AWAITING OFFICIAL MEDIA</span>
        </div>
      )}
      <dialog
        className="lightbox"
        ref={dialog}
        onCancel={() => setSelected(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelected(null);
        }}
      >
        <button
          className="icon-button"
          aria-label="Close gallery viewer"
          onClick={() => setSelected(null)}
        >
          <X />
        </button>
        {selected && (
          <>
            {selected.type === "image" ? (
              <Image
                src={selected.src}
                unoptimized={selected.src.startsWith("/media/")}
                alt={selected.alt}
                width={selected.width}
                height={selected.height}
                sizes="90vw"
              />
            ) : (
              <video controls poster={selected.poster} preload="metadata">
                <source src={selected.src} />
                {selected.captions && (
                  <track
                    default
                    kind="captions"
                    src={selected.captions}
                    srcLang="en"
                    label="English"
                  />
                )}
              </video>
            )}
            <p>{selected.caption}</p>
          </>
        )}
      </dialog>
    </div>
  );
}
// Pass new verified entries from a future live-results adapter. Stable team IDs
// preserve row identity and animate real rank changes without inventing scores.
export function Leaderboard({ entries = teams }: { entries?: Team[] }) {
  const [city, setCity] = useState("All cities");
  const body = useRef<HTMLTableSectionElement>(null);
  const previous = useRef(new Map<string, number>());
  const list = entries
    .filter((t) => city === "All cities" || t.city === city)
    .sort((a, b) => a.rank - b.rank);
  useLayoutEffect(() => {
    const rows =
      body.current?.querySelectorAll<HTMLTableRowElement>("[data-team]");
    const animations: Animation[] = [];
    rows?.forEach((row) => {
      const id = row.dataset.team!;
      const y = row.getBoundingClientRect().top;
      const old = previous.current.get(id);
      if (
        old !== undefined &&
        old !== y &&
        !matchMedia("(prefers-reduced-motion: reduce)").matches &&
        y > 0 &&
        y < innerHeight
      ) {
        animations.push(
          row.animate(
            [
              {
                transform: `translateY(${old - y}px)`,
                background: "#ff692929",
              },
              { transform: "translateY(0)", background: "transparent" },
            ],
            { duration: 650, easing: "cubic-bezier(.22,1,.36,1)" },
          ),
        );
      }
      previous.current.set(id, y);
    });
    return () => animations.forEach((a) => a.cancel());
  }, [entries, city]);
  return (
    <div className="leaderboard">
      <div className="board-top">
        <span>
          <span className="live-dot" /> OFFICIAL STANDINGS
        </span>
        <label className="sr-only" htmlFor="leaderboard-city">
          Filter standings by city
        </label>
        <select
          id="leaderboard-city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          {["All cities", ...new Set(entries.map((t) => t.city))].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <span className="micro">
          {entries.length ? "PUBLISHED RESULTS" : "SEASON TO BE ANNOUNCED"}
        </span>
      </div>
      <div className="table-scroll">
        <table>
          <caption className="sr-only">
            Robo Goal India official team rankings
          </caption>
          <thead>
            <tr>
              {[
                "Rank",
                "Team / Institution",
                "City",
                "Matches",
                "Goals",
                "Wins",
                "Points",
                "Qualification",
              ].map((h) => (
                <th scope="col" key={h}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody ref={body}>
            {list.length ? (
              list.map((t) => (
                <tr key={t.id} data-team={t.id}>
                  <td>{String(t.rank).padStart(2, "0")}</td>
                  <td>
                    <Link href={`/teams/${t.slug}`}>{t.name}</Link>
                    <small>{t.institution}</small>
                  </td>
                  <td>{t.city}</td>
                  <td>{t.matches}</td>
                  <td>{t.goals}</td>
                  <td>{t.wins}</td>
                  <td className="points">{t.points}</td>
                  <td>{t.qualification}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8}>
                  <div className="board-empty">
                    <Trophy size={25} />
                    <span>
                      Your team could be here.
                      <small>
                        Rankings will appear after verified match results are
                        published.
                      </small>
                    </span>
                    <Link href="/contact?type=Team+Registration">
                      Join the movement <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
