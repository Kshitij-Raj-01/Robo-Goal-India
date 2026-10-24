import type { Metadata } from "next";
import { GraduationCap, Handshake, MessageSquare, Check } from "lucide-react";
import Link from "next/link";
import { PageHero, Eyebrow } from "@/components/ui";
import { CollaborationForm } from "@/components/collaboration-form";
import { collaborationBenefits } from "@/lib/content";
export const metadata: Metadata = {
  title: "Collaborate With Us",
  description:
    "Host a campus competition, sponsor the league or become a strategic partner. Build the future of robotic sports with Robo Goal India.",
  alternates: { canonical: "/collaborate" },
};
export default async function Collaborate({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; subject?: string }>;
}) {
  const { type, subject } = await searchParams;
  return (
    <>
      <PageHero
        eyebrow="FOR INSTITUTIONS, BRANDS & BELIEVERS"
        title="BUILD THE FUTURE OF"
        accent="ROBOTIC SPORTS WITH US."
        description="Collaborate with Robo Goal India as a hosting institution, sponsor or strategic partner and help us take practical robotics competitions to students across India."
      />
      <section className="section container">
        <div className="info-grid">
          {[
            {
              icon: GraduationCap,
              title: "Host a Competition",
              text: "Turn your campus or venue into the next robotic sports arena.",
              type: "Host a Campus Round",
            },
            {
              icon: Handshake,
              title: "Sponsorship or Brand Partnership",
              text: "Connect your organization with the builders of tomorrow.",
              type: "Competition Sponsorship",
            },
            {
              icon: MessageSquare,
              title: "General Enquiry",
              text: "Have another idea or a question? Start a conversation with us.",
              type: "General Enquiry",
            },
          ].map((o) => (
            <Link
              key={o.type}
              href={`/collaborate?type=${encodeURIComponent(o.type)}#request`}
              className="info-card"
            >
              <o.icon size={33} />
              <h3>{o.title}</h3>
              <p>{o.text}</p>
              <span className="text-link">Let’s explore it ↗</span>
            </Link>
          ))}
        </div>
      </section>
      <section id="request" className="container collaboration-layout">
        <aside>
          <Eyebrow>BETTER, TOGETHER.</Eyebrow>
          <h2>
            MAKE YOUR
            <br />
            <em>MOVE.</em>
          </h2>
          <p>
            Schools. Colleges. Universities. Brands. Communities. There’s a
            place for everyone who believes in learning by doing.
          </p>
          <ul className="benefits-list">
            {collaborationBenefits.map((b) => (
              <li key={b}>
                <Check size={16} />
                {b}
              </li>
            ))}
          </ul>
          <div className="review-note">
            <span className="micro">WHAT HAPPENS NEXT?</span>
            <ol>
              <li>Receive your unique request reference.</li>
              <li>Our team reviews your collaboration idea.</li>
              <li>We connect to explore the next steps.</li>
            </ol>
          </div>
        </aside>
        <CollaborationForm
          key={type || "default"}
          initialType={type || "Host a Campus Round"}
          initialSubject={subject || ""}
        />
      </section>
    </>
  );
}
