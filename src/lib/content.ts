export const site = {
  name: "Robo Goal India",
  organizer: "Robotic Sir AI India Pvt. Ltd.",
  url: "https://robogoalindia.com",
  parentUrl: "https://roboticsir.com",
  email: "ai@roboticsir.com",
  phone: "+91-8294579554",
  phones: [
    { label: "Delhi", number: "+91-8294579554" },
    { label: "Noida", number: "+91-9267913431" },
  ],
  addresses: [
    "Delhi: Robotic Sir, F-24, near Preet Vihar Metro and TATA Westside, Metro Pillar 95, above Zevar Mahal, Preet Vihar, New Delhi, Delhi 110092",
    "Noida: Spectrum Metro, BF-74, Tower B, First Floor, Phase 2, Sector 75, Noida, Uttar Pradesh 201316",
  ],
  businessHours:
    "Monday–Sunday, 10:00 AM–10:00 PM. Please call before visiting.",
  mapUrl: "https://maps.google.com/?q=Robotic+Sir+Preet+Vihar+New+Delhi",
  socials: [
    { name: "YouTube", url: "https://youtube.com/@roboticsirofficial" },
    {
      name: "Instagram",
      url: "https://www.instagram.com/roboticsir_official/",
    },
    { name: "Facebook", url: "https://www.facebook.com/roboticsir/" },
  ],
};
export const navigation = [
  ["Home", "/"],
  ["About", "/about"],
  ["Tour Format", "/tour"],
  ["Events", "/events"],
  ["Fixtures", "/fixtures"],
  ["Gallery", "/gallery"],
  ["Partners", "/partners"],
  ["Collaborate With Us", "/collaborate"],
  ["Contact", "/contact"],
];
export const statistics = [
  "Cities",
  "Campus Rounds",
  "Student Innovators",
  "Partner Institutions",
  "Robots Built",
].map((label) => ({ label, value: null as number | null }));
export const stages = [
  {
    name: "Campus Rounds",
    short: "Your campus. Your starting line.",
    description:
      "Build your first competition robot and put your ideas to the test with teams from your institution.",
    eligibility:
      "Students from participating institutions; final age and team rules to be announced.",
    teams: "To be announced",
    qualification: "Register through an approved campus host.",
    venue: "School, college or university campus",
    advancement:
      "Qualification criteria will be published before registration opens.",
  },
  {
    name: "City Qualifiers",
    short: "Take on your city.",
    description:
      "Campus teams come together for a city-level test of engineering, teamwork and match strategy.",
    eligibility: "Eligible campus teams under published rules.",
    teams: "To be announced",
    qualification: "Campus qualification, subject to official rules.",
    venue: "City partner venue",
    advancement: "City results and published qualification criteria.",
  },
  {
    name: "Regional Rounds",
    short: "A bigger arena. A tougher challenge.",
    description:
      "Qualifying teams represent their cities against contenders from across the region.",
    eligibility: "Qualified city teams.",
    teams: "To be announced",
    qualification: "City qualifier results.",
    venue: "Regional host institution or sports venue",
    advancement: "Regional results and published qualification criteria.",
  },
  {
    name: "National Qualifiers",
    short: "Earn your place on the national stage.",
    description:
      "The proposed national pathway brings regional contenders together for the final qualification challenge.",
    eligibility: "Qualified regional teams.",
    teams: "To be announced",
    qualification: "Regional qualification.",
    venue: "National qualifying venue to be announced",
    advancement: "Official national qualification criteria to be announced.",
  },
  {
    name: "National League",
    short: "The future of Indian robotic sport.",
    description:
      "Our future vision: the Robo Goal India National League, bringing the country’s robotic sports community into one arena.",
    eligibility: "To be announced with league regulations.",
    teams: "To be announced",
    qualification: "Proposed national qualifier pathway.",
    venue: "To be announced",
    advancement: "Future league format and regulations to be announced.",
  },
];
export const skills = [
  "Robotics",
  "Electronics",
  "Programming",
  "Mechanical design",
  "Strategy",
  "Teamwork",
  "Problem-solving",
];
export const hostingBenefits = [
  "Campus and national visibility",
  "Recognition under the New-Age Learning Initiative",
  "Hands-on STEM engagement",
  "A structured robotics competition pathway",
  "Event and social-media promotion",
  "Opportunities to qualify for higher rounds",
  "A long-term robotics community",
];
export const collaborationBenefits = [
  "National brand visibility",
  "Student and institutional engagement",
  "Event branding and digital promotion",
  "On-ground activation",
  "Association with practical technology education",
  "Access to a growing robotics community",
  "Long-term collaboration opportunities",
];
export const sponsorTiers = [
  "Title Partner",
  "Presented By",
  "Powered By",
  "Technology Partner",
  "Education Partner",
  "Venue Partner",
  "Community Partner",
  "Media Partner",
  "Equipment Partner",
  "Campus Partner",
];
export const galleryCategories = [
  "Robo Soccer",
  "Robo Race",
  "Teams",
  "Awards",
  "Campus Rounds",
  "Judges and Guests",
  "Behind the Scenes",
  "Workshops",
  "Video Highlights",
];
export type EventRecord = {
  slug: string;
  title: string;
  city: string;
  venue: string;
  date: string;
  type: "Robo Soccer" | "Robo Race" | "Campus Round";
  status: "Completed" | "Upcoming";
  teams: number | null;
  participants: number | null;
  winners: string[];
  cover: string;
  results: string;
  judges: string[];
  sponsors: string[];
  galleryIds: string[];
  highlights: string;
  endDate?: string;
  registrationUrl?: string;
};
export type Fixture = {
  id: string;
  city: string;
  venue: string;
  date: string | null;
  stage: string;
  status: "Completed" | "Current" | "Upcoming" | "To be announced";
  registrationStatus: "Open" | "Closed" | "To be announced";
  registrationUrl?: string;
  directionsUrl?: string;
  x: number;
  y: number;
};
export type Media = {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  category: string;
  caption: string;
  type: "image" | "video";
  captions?: string;
  poster?: string;
};
export type Partner = {
  id: string;
  logo: string;
  name: string;
  city: string;
  type: string;
  roundHosted: string;
  website: string;
};
export type Sponsor = {
  id: string;
  logo: string;
  name: string;
  website: string;
  tier: string;
  description: string;
};
export type Team = {
  id: string;
  slug: string;
  name: string;
  institution: string;
  city: string;
  leader: string;
  members: string[];
  achievements: string[];
  eventSlugs: string[];
  image: string;
  matches: number;
  goals: number;
  wins: number;
  points: number;
  qualification: string;
  rank: number;
};
export type Robot = {
  slug: string;
  name: string;
  teamId: string;
  weight: string;
  dimensions: string;
  motors: string;
  controller: string;
  battery: string;
  features: string[];
  images: string[];
  performance: { label: string; value: string }[];
};
// Publish verified records here, or replace this module with your CMS adapter.
// Empty arrays are intentional: no fabricated participants, events, venues or results.
export const events: EventRecord[] = [];
export const fixtures: Fixture[] = [];
export const media: Media[] = [];
export const partners: Partner[] = [];
export const sponsors: Sponsor[] = [];
export const teams: Team[] = [];
export const robots: Robot[] = [];
export const judges: {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
}[] = [];
export const announcements: {
  id: string;
  heading: string;
  description: string;
  city: string;
  publishedAt: string;
}[] = [];
export const documents: {
  slug: string;
  title: string;
  body: string;
  published: boolean;
}[] = [
  {
    slug: "rules",
    title: "Competition Rules",
    body: "Official robot specifications, eligibility, scoring, safety requirements and qualification criteria will be published before registration opens.",
    published: false,
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    body: `Privacy Policy · version 27 October 2026

Who we are
Robo Goal India (RGI) is organized by Robotic Sir AI India Pvt. Ltd. For privacy requests, corrections, withdrawal of consent or complaints, contact ai@roboticsir.com or use the organizer details on our Contact page. Describe your request without sending passwords or identity documents unless a secure verification process is agreed.

Information collected
When you send an enquiry, we collect the name, organization, organization type, email, telephone number, city/state, message, consent choices and any optional hosting/partnership details or attachment you provide. Technical request information may include network address, time, browser information, security verification outcome and request reference. Network identifiers used by application rate limits are hashed. Necessary admin cookies protect staff sign-in; a session-storage flag prevents the intro replaying within your browser tab.

Why information is used
We use enquiry information to respond, assess hosting or partnership proposals, coordinate follow-up, maintain submission records and protect the service against abuse. Optional publicity or marketing requires a separate decision; an enquiry is not permission for unrelated advertising. Do not submit sensitive personal records, payment details or unnecessary information about other people.

Service providers and disclosure
Authorized staff and contracted hosting, database, security verification and email providers may process information only for operating this service and handling requests. We may disclose information when legally required or necessary to protect rights and service security. We do not sell enquiry information. Hosting locations and provider arrangements must be confirmed by the organizer before production enquiries open.

Photos and children
The gallery publishes organizer-approved images. Administrators must confirm image rights and required participant/parent or guardian permissions before publication. Enquiries should be sent by an adult institutional representative or a parent/guardian, not by children supplying their personal details. Contact us to request review or removal of an identifiable image; we may need proportionate verification. Participation and image permissions are handled separately from a general enquiry.

Retention and safeguards
Records are restricted to authorized personnel and retained only while needed for the request, legal obligations, dispute handling or security. Closed enquiries should be reviewed for deletion or anonymization at least annually; backups follow the operator’s retention schedule. Access controls, TLS in production and operational backups reduce risk but cannot guarantee absolute security. The organizer is responsible for enforcing retention, provider agreements and incident-response procedures.

Your choices
You may request information about your data, correction, deletion, withdrawal of consent or grievance review through the contact above. Withdrawal does not undo processing already carried out, and some records may need to be kept for legal reasons. We will assess requests, verify identity proportionately where necessary and respond under applicable law. You may pursue available legal complaint mechanisms where applicable.

Changes
Material changes will be reflected in the version date and notice on this page. This policy must be reviewed and approved by the organizer against actual operations before production forms are enabled.`,
    published: true,
  },
  {
    slug: "terms",
    title: "Terms & Conditions",
    body: `Terms & Conditions · version 27 October 2026

About this website
These terms govern use of the Robo Goal India (RGI) website operated by Robotic Sir AI India Pvt. Ltd. Contact the organizer through the Contact page or ai@roboticsir.com. Use the site lawfully and respect other users, participants and institutions.

Information and announcements
Competition pathways, proposed stages and future league plans are indicative unless confirmed in an official event announcement. Dates, venues, eligibility and formats may change. Published event-specific rules and a written organizer confirmation govern participation. Website information and blog articles are general information, not a guarantee of qualification, safety, results or professional advice.

Enquiries and participation
Submitting a contact, hosting, sponsorship or partnership request is an expression of interest, not an accepted registration, contract, reservation, sponsorship agreement or promise of selection. An authorized adult should submit accurate information on behalf of an institution. Do not impersonate another person or submit personal information without authority. Separate written terms, safety rules and any required parent/guardian permissions apply before participation.

Payments
This website does not currently accept payments. Do not send payment-card details or transfer funds in response to an unverified message. Paid registration, cancellation and refund terms will be published before any payment facility launches.

Acceptable use and submissions
Do not attack the service, bypass rate limits, upload malicious files, scrape private records, spam forms or infringe others’ rights. You retain rights in your submitted material and permit the organizer to use it only to assess and respond to your request. Enquiry attachments are not automatically public. Publication of photos and stories requires appropriate rights and permissions.

Intellectual property and links
RGI and Robotic Sir branding, original website content and licensed materials may not be misrepresented as your own or used to imply endorsement. Third-party materials remain subject to their respective rights. External links are provided for convenience; external services have their own terms and privacy practices.

Availability and responsibility
We take reasonable care but do not promise uninterrupted access or that all content will always be complete or current. To the extent permitted by applicable law, responsibility is limited to losses reasonably attributable to the organizer’s breach; nothing excludes liability or consumer rights that cannot lawfully be excluded. Competition risks and responsibilities must be set out in event-specific participation terms, not inferred from this website.

Privacy, changes and disputes
The Privacy Policy explains enquiry data use. Updated terms will be shown with a revised version date; material changes do not silently alter an existing signed agreement. Indian law applies, subject to mandatory rights and competent courts or authorities. Contact the organizer first to seek a practical resolution. The organizer must review and approve these terms before enabling production submissions.`,
    published: true,
  },
];
