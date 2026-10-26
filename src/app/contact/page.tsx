import type { Metadata } from "next";
import { PageHero, Button } from "@/components/ui";
import { site } from "@/lib/content";
export const metadata: Metadata = {
  title: "Contact",
  alternates: { canonical: "/contact" },
};
const categories = [
  ["Host a Campus Round", "Host a Campus Round"],
  ["Sponsor the League", "Competition Sponsorship"],
  ["Institutional Collaboration", "Institutional Collaboration"],
  ["Team Registration", "General Enquiry"],
  ["Media Enquiry", "Media Partnership"],
  ["General Enquiry", "General Enquiry"],
];
export default function Contact() {
  return (
    <>
      <PageHero
        eyebrow="LET’S TALK ROBOTIC SPORTS"
        title="GREAT THINGS START"
        accent="WITH A CONVERSATION."
        description="Bring an idea, a question or an opportunity. Let’s find your place in the Robo Goal India story."
      />
      <section className="section container content-grid">
        <div className="prose">
          <h2>GET IN TOUCH.</h2>
          <p>{site.organizer}</p>
          <div className="contact-details">
            {site.addresses.map((address, index) => (
              <div className="contact-detail" key={address}>
                <span className="micro">
                  {index === 0 ? "DELHI / HEAD OFFICE" : "NOIDA CENTRE"}
                </span>
                <p>{address.replace(/^(Delhi|Noida): /, "")}</p>
              </div>
            ))}
            <div className="contact-detail">
              <span className="micro">PHONE</span>
              {site.phones.map((phone) => (
                <p key={phone.number}>
                  <a href={`tel:${phone.number}`}>
                    {phone.label}: {phone.number}
                  </a>
                </p>
              ))}
            </div>
            {[
              ["EMAIL", site.email || "Official email — to be announced"],
              [
                "BUSINESS HOURS",
                site.businessHours || "Business hours — to be announced",
              ],
            ].map(([l, v]) => (
              <div className="contact-detail" key={l}>
                <span className="micro">{l}</span>
                <p>
                  {l === "EMAIL" && site.email ? (
                    <a href={`mailto:${site.email}`}>{v}</a>
                  ) : (
                    v
                  )}
                </p>
              </div>
            ))}
            <a
              className="text-link"
              href={site.parentUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              roboticsir.com ↗
            </a>
            {site.mapUrl && (
              <a
                className="text-link"
                href={site.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View office on Google Maps ↗
              </a>
            )}
            {site.socials.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {s.name} ↗
              </a>
            ))}
          </div>
        </div>
        <div>
          <h3>HOW CAN WE HELP?</h3>
          <div className="contact-categories">
            {categories.map(([name, type]) => (
              <a
                key={name}
                href={`/collaborate?type=${encodeURIComponent(type)}&subject=${encodeURIComponent(name)}`}
              >
                {name}
                <span>↗</span>
              </a>
            ))}
          </div>
          <p>
            Use our enquiry form to send your request directly to the organizing
            team.
          </p>
          <Button href="/collaborate">Send an Enquiry</Button>
        </div>
      </section>
    </>
  );
}
