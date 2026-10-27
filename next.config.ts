import type { NextConfig } from "next";
const config: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async redirects() {
    return [{ source: "/admin", destination: "/cms-admin/", permanent: false }];
  },
  async rewrites() {
    const origin = process.env.CMS_INTERNAL_URL;
    return origin
      ? [
          { source: "/media/:path*", destination: `${origin}/media/:path*` },
          {
            source: "/cms-admin/:path*",
            destination: `${origin}/cms-admin/:path*`,
          },
          {
            source: "/django-static/:path*",
            destination: `${origin}/django-static/:path*`,
          },
        ]
      : [];
  },
  serverExternalPackages: ["postgres", "nodemailer"],
  images: { formats: ["image/avif", "image/webp"] },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};
export default config;
