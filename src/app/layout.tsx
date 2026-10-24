import type { Metadata, Viewport } from "next";
import { Navbar, Footer, Analytics } from "@/components/shell";
import { JsonLd } from "@/components/ui";
import { site } from "@/lib/content";
import "@fontsource/barlow/latin-400.css";
import "@fontsource/barlow/latin-500.css";
import "@fontsource/barlow/latin-600.css";
import "@fontsource/barlow/latin-700.css";
import "@fontsource/barlow-condensed/latin-600.css";
import "@fontsource/barlow-condensed/latin-700.css";
import "@fontsource/barlow-condensed/latin-800.css";
import "@fontsource/barlow-condensed/latin-900.css";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || site.url),
  title: {
    default: "Robo Goal India — Build. Compete. Conquer.",
    template: "%s | Robo Goal India",
  },
  description:
    "India’s robotic sports initiative. Robotic soccer, Robo Race and a competition journey from your campus to the national stage. Organized by Robotic Sir AI India Pvt. Ltd.",
  openGraph: {
    type: "website",
    siteName: site.name,
    title: "Robo Goal India — Build. Compete. Conquer.",
    description: "Engineering meets the energy of sport.",
    images: [
      {
        url: "/images/stadium.webp",
        width: 1672,
        height: 941,
        alt: "Robo Goal India robotic stadium concept artwork",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { themeColor: "#070d18" };
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
        <Analytics />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: site.name,
            url: site.url,
            parentOrganization: {
              "@type": "Organization",
              name: site.organizer,
              url: site.parentUrl,
            },
          }}
        />
      </body>
    </html>
  );
}
