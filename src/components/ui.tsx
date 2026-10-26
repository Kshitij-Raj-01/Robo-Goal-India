import Link from "next/link";
import { ArrowUpRight, ArrowRight, Crosshair } from "lucide-react";
import type { ReactNode } from "react";
import Image from "next/image";
import roboticSirLogo from "../../public/images/robotic-sir-logo.webp";

export function OrganizerLogo({ prominent = false }: { prominent?: boolean }) {
  return (
    <a
      className={`organizer-logo ${prominent ? "organizer-logo-prominent" : ""}`}
      href="https://roboticsir.com"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Robotic Sir — organizer of Robo Goal India (opens in a new tab)"
    >
      <span>Organized by</span>
      <span className="organizer-logo-plate">
        <Image
          src={roboticSirLogo}
          alt="Robotic Sir"
          sizes={prominent ? "(max-width: 700px) 75vw, 400px" : "160px"}
        />
      </span>
    </a>
  );
}
export function Brand({ small = false }: { small?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand ${small ? "small" : ""}`}
      aria-label="Robo Goal India home"
    >
      <span className="brand-mark">
        <span>R</span>
        <i />
      </span>
      <span className="brand-type">
        ROBO GOAL
        <span>
          INDIA <b>◆</b>
        </span>
      </span>
    </Link>
  );
}
export function Button({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link className={`button ${secondary ? "secondary" : ""}`} href={href}>
      {children}
      <ArrowUpRight size={17} />
    </Link>
  );
}
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="eyebrow">
      <span />
      {children}
    </div>
  );
}
export function SectionHead({
  number,
  title,
  accent,
  description,
  href,
  link,
}: {
  number: string;
  title: string;
  accent?: string;
  description?: string;
  href?: string;
  link?: string;
}) {
  return (
    <div className="section-head">
      <div>
        <Eyebrow>{number} / THE ROBO GOAL EXPERIENCE</Eyebrow>
        <h2>
          {title} {accent && <em>{accent}</em>}
        </h2>
        {description && <p>{description}</p>}
      </div>
      {href && (
        <Link className="text-link" href={href}>
          {link || "Explore"} <ArrowUpRight size={18} />
        </Link>
      )}
    </div>
  );
}
export function PageHero({
  eyebrow,
  title,
  accent,
  description,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  description: string;
}) {
  return (
    <header className="page-hero container">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1>
        {title} {accent && <em>{accent}</em>}
      </h1>
      <p>{description}</p>
      <span className="hero-coordinate">RGI / INDIA / NEXT GENERATION</span>
    </header>
  );
}
export function EmptyState({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="empty-state">
      <Crosshair size={34} strokeWidth={1} />
      <span className="micro">THE NEXT CHAPTER IS LOADING</span>
      <h3>{title}</h3>
      <p>{description}</p>
      {href && (
        <Link className="text-link" href={href}>
          {action || "Get in touch"} <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
