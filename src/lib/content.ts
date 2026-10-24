export const site = {
  name: "Robo Goal India",
  organizer: "Robotic Sir AI India Pvt. Ltd.",
  url: "https://robogoalindia.com",
  parentUrl: "https://roboticsir.com",
  email: "",
  phone: "",
  addresses: [] as string[],
  businessHours: "",
  mapUrl: "",
  socials: [] as { name: string; url: string }[],
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
    body: "The organizer’s approved privacy policy is awaiting publication. Production enquiries remain disabled until the policy and terms are approved. This development preview stores test enquiries for demonstrating the workflow.",
    published: false,
  },
  {
    slug: "terms",
    title: "Terms & Conditions",
    body: "Official participation and website terms are awaiting organizer approval. No paid registration or binding competition entry is available on this preview.",
    published: false,
  },
  {
    slug: "refund",
    title: "Refund Policy",
    body: "The refund and cancellation policy will be published before any paid registration opens. This website currently accepts no payments.",
    published: false,
  },
];
