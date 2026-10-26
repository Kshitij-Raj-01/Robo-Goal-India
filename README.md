# Robo Goal India

Original, responsive robotic-sports website for **robogoalindia.com**, organized by **Robotic Sir AI India Pvt. Ltd.** Built with Next.js 16.4.3 App Router, React 19, TypeScript, GSAP, Three.js and Zod.

## Run locally

Use Node.js 24 LTS (the development database uses `node:sqlite`).

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Enquiries work in development with SQLite in `data/requests.sqlite`. No SMTP configuration means notifications remain in the durable outbox; they are not falsely reported as sent. Do not enter real personal information into an unsecured development instance.

```sh
npm test
npm run typecheck
npm run build
npm run test:integration
npm start
```

The scripts use Next.js's supported webpack option because the restricted Windows environment prevents Turbopack from creating dependency junctions. The application follows the installed `node_modules/next/dist/docs` App Router, route handler, metadata and `after` documentation. No Pages Router APIs are used.

## Routes and components

- `/`: stadium homepage, cinematic first-session intro, discipline cards, tour, fixtures, campus hosting, events, standings, organizer, media and collaboration.
- `/about`, `/tour`, `/events`, `/fixtures`, `/gallery`, `/partners`, `/sponsors`, `/leaderboard`, `/teams`, `/robots`.
- `/events/[slug]`, `/teams/[slug]`, `/robots/[slug]`: data-driven detail templates; unpublished slugs return 404.
- `/collaborate`: conditional hosting, sponsorship and enquiry form. `?type=Host+a+Campus+Round` and `?type=Competition+Sponsorship` preselect the branch. `subject` prefills general enquiries.
- `/contact`: organizer details and enquiry categories.
- `/documents/rules`, `/documents/privacy`, `/documents/terms`, `/documents/refund`.
- `/admin`: authenticated enquiry review, status changes, internal notes, audit history, private attachments, email retry and Excel-compatible CSV export.
- `/api/enquiries`: same-origin POST; shared frontend/backend Zod validation; bounded 6 MB request body; signed provider challenge in production; honeypot and minimum completion time; persisted per-email hourly limits; 5 MB PDF/JPEG/PNG content signature validation; atomic deduplication; unique reference; transactional email outbox.

## Content editing

`src/lib/content.ts` is the CMS-ready content repository. It provides typed models for statistics, stages, events, fixtures, media, institutions, sponsors, teams, robots, judges, announcements, contact and documents. Replace its exports with validated CMS fetches when a CMS is selected. Never put unpublished or private team-member information in these public collections.

Empty collections are intentional, not missing demo data. There are **no invented events, results, sponsors, institutions, statistics, judges, phone numbers or addresses**. `null` statistics render as “coming into play”. Publish only organizer-approved records. Add genuine event photos under `public/media`, with dimensions and meaningful alt text. Provide WebVTT captions for videos. Partner/sponsor logos use contain fitting.

The homepage hero uses `public/images/robo-goal-hero-cgi.webp`, a realistic CGI illustration based on both event photographs supplied by the user, styled for the dark theme. It has a one-shot five-second camera drift, paused during the opening gate and disabled for reduced motion. The soccer card, About image and social preview retain the genuine event photograph `public/images/robo-goal-event.webp`. Shared header/footer branding now uses a transparent dark-theme adaptation of the supplied Robo Goal India wordmark; Robotic Sir placements use its transparent white-lettered adaptation without a white plate. Original logos are retained unchanged, including the exact curtain artwork. `public/ASSETS.md` and `public/images/HERO_BRANDING_PROMPTS.md` record provenance, generated source filenames and prompts. Public contact details are shared in `src/lib/content.ts` and appear on the homepage, footer and Contact page.

The SVG tour map is a schematic, explicitly not a political boundary map. Add confirmed cities to `fixtures` with map coordinates in the 600 × 590 viewBox. No unconfirmed city is presented as a scheduled event. Published fixtures drive status labels, countdowns, map routes and accessible lists. The national league is described as a future vision, not an already operational league.

## Production configuration

Copy `.env.example` to `.env.local` for local configuration or set equivalent private environment variables on your hosting platform.

1. Deploy to a **Node.js-compatible Next.js host**, with HTTPS and a managed PostgreSQL database. Set `DATABASE_URL` to a provider connection URL with TLS enabled. The schema is created on first use; for restricted database roles, apply the DDL from `src/lib/database.ts` in your migration process first. Back up the database and apply appropriate access/retention policies. SQLite is deliberately prohibited in production by default.
2. Set `NEXT_PUBLIC_SITE_URL=https://robogoalindia.com` before building and configure both apex and `www` DNS with your hosting provider. Choose one canonical host; redirect the other at the edge. This repository does **not** change DNS or register the domain.
3. Set a random `ADMIN_TOKEN` of at least 32 characters. It is private server configuration, held only in browser memory after entry and never persisted in local/session storage. The baseline administrator is one operator, labelled Administrator in audits. For an organization with multiple operators, replace this access gate with identity-provider SSO, per-user audit actors and role-based access before distributing access. Never expose the admin token through NEXT_PUBLIC variables.
4. Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM` and `ADMIN_EMAIL`. Authenticate the sender domain with your email provider. Email jobs are queued transactionally and delivered after the HTTP response; failed jobs remain queued. Use the admin “Retry Queued Emails” action, or an external job invoking authenticated `POST /api/admin/requests` with the canonical Origin header. The queue uses short leases; SMTP delivery is at-least-once after a crash, with a stable Message-ID. Verify actual delivery to both recipients before launch.
5. Configure Cloudflare Turnstile with the domain and set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` before build and `TURNSTILE_SECRET_KEY` on the server. Production validates both success and hostname. Put edge rate limits and request-size limits in front of public APIs; application limits supplement them.
6. Obtain organizer-approved Terms and Privacy Policy, publish their bodies in `documents` and mark both `published: true`, then set `POLICIES_APPROVED=true`. The production enquiry endpoint fails closed until these conditions hold. The current documents are labelled publication-pending placeholders, not legal advice or final policies. Publish competition/refund rules before registration or payments open.
7. Add approved logos, real event media, contact details and verified content. No payments or competitor registration system is implied by the collaboration form. Fixture registration buttons appear only when a confirmed registration URL is provided.

`ALLOW_LOCAL_DB=true` is a **local production-build smoke-test override only**; never set it on a public deployment. It permits local SQLite and bypasses production-only policies/challenge gates for test data.

The Sites plugin runtime uses a different Worker/Vinext deployment path; this application retains the user's requested actual Next.js/Node backend. It is not published to Sites or to robogoalindia.com. Deploy the verified Next.js build to a compatible Node host once production configuration is available.

## Form administration and security

All admin API operations require a server-verified bearer credential. Writes additionally require a same-origin request. Attachments are private database payloads, returned as forced octet-stream downloads, never inline public assets. Type/size/signature checks are included; for high-volume deployments add malware scanning and private object storage with a retention policy. Data export neutralizes spreadsheet formula injection and includes a UTF-8 BOM for Excel. Export currently includes the most recent 1,000 enquiries; extend with cursor pagination for larger volumes.

Statuses: New, Under Review, Contacted, Meeting Scheduled, Approved, Declined, Closed. Changes append timestamped audit events. No request-delete endpoint is exposed. Applicant contact/terms consent are retained with the submitted record.

## Motion, accessibility and performance

- A synchronous homepage-only head script and critical inline CSS hide the page before its first paint. The 8.6-second sequence shows a 250-person animated crowd, the bot scoring, confetti and a broad robotics hardware scatter. White/light-orange folded curtains descend and display the exact organizer-supplied logo. The football O in GOAL becomes a portal; the assembled 3D bot emerges through it before the curtains part over the homepage. The existing WebGL renderer is reused with transparency for this entrance. Timings and portal coordinates live in `src/lib/intro-config.ts`. Module loading is capped at 6.5 seconds, playback has an 11-second failsafe, and bootstrap has a 15-second escape. Reduced-motion and no-JavaScript fallbacks preserve access. No controls or audio are displayed; cheering is visual, using waving, clapping, jumping and flags.
- Foreground ESP32, Arduino Uno, battery and motor-driver assets are AI-generated realistic CGI cutouts, animated on transparent planes with perspective, drift and shadow layers, not product photographs or downloaded 3D meshes. Native 3D wheels, DC motors, gears, servo, sensor, MOSFETs, capacitors, connectors, wires, fasteners and chassis parts broaden the scatter. Assets and prompts are recorded in `public/ASSETS.md` and `public/images/components/PROMPTS.md`. No Sketchfab asset or authentication is used.
- Three.js is loaded dynamically for the opening, including mobile devices with adaptive framing and bounded pixel ratio. Geometry is merged by material inside each detachable assembly; bloom is reserved for stronger devices. Geometry, materials, listeners and render loops are disposed after use. Rendering pauses in hidden tabs.
- The illustrative robot is based on actual event photographs: low sheet-metal chassis, sloping metal scoops, orange perforated rubber tyres, pale nylon hubs, silver battery retaining tape, exposed controller/driver electronics, DC motors and wiring. It is not a scan or an exact replica of a participant's machine. Hardware separates only after the goal, then moves into camera-relative foreground positions for close-ups across both portrait and wide screens. Confetti uses instanced geometry, and the goal celebration appears inside the 3D stadium.
- Website text has an 18px minimum, with larger display headings. Navigation, statistics, forms and footer layouts reflow at smaller viewports.
- ScrollTrigger drives the tour marker. The visible pitch art is a single compressed image; public page shells and content render on the server. Images have dimensions or stable fill containers. Gallery photos load lazily; hero preloads. Public sections split through routes; Three.js loads dynamically.
- Navigation has a skip link, visible focus states, an accessible mobile dialog and keyboard trapping. Tournament tabs support arrow/Home/End keys. Gallery uses a native dialog; maps have text alternatives and status labels. Dynamic form errors are associated with fields and announced. No autoplay audio.
- Analytics is opt-in: subscribe to the `rgi:interaction` browser event. The built-in events include navigation and enquiry type only; no applicant PII is emitted. Connect a consent-aware analytics provider as required.
- Organization JSON-LD, verified-event JSON-LD, per-route metadata, Open Graph, sitemap, robots rules, icon and error states are included. Add event structured data only by publishing real event records.

## Verification

The dark hero/branding update passed all 17 unit tests, TypeScript, the production build and isolated HTTP integration checks. Browser QA at desktop and 390×844 confirmed visible transparent wordmarks, the CGI hero, the dedicated mobile artwork band, no horizontal overflow and clean intro/gate release. Both shared wordmarks also loaded on Contact, and organizer plates computed to a transparent background. Browser warnings/errors were empty. Hero motion is a five-second CSS camera drift, not independent robot animation; reduced-motion CSS disables it.

`npm test` covers shared validation, required subtype fields, attachment signature/size enforcement, formula-safe exports, authentication, origin checks, bounded request parsing, database deduplication, concurrent duplicate requests, email outbox creation and persisted rate limits.

After building, `npm run test:integration` starts an isolated production server on port 3100 with a temporary SQLite database and a random in-memory admin token. It checks public routes, unpublished-record 404 responses, invalid and cross-origin submissions, successful receipt creation, duplicate submissions, administrator authentication, status/notes changes, audit history, private attachments and CSV export. SMTP is explicitly disabled; this test never sends email. The test shuts down its server afterwards.

The current opening was verified in a production preview at 1280×720 and 390×844: animated audience, bot scoring, broad hardware scatter with rendered electronics, white/light-orange curtains, supplied logo and the assembled bot emerging from its football O. Browser measurements confirmed that the logo remains centered during canvas transfer. The homepage opens after the curtains part; the intro, gate and all inert attributes are removed. Mobile body text remains 18px with no horizontal overflow. No browser warnings or errors were reported. All 15 unit tests, TypeScript, the production build and the isolated HTTP integration test passed. Regression checks cover the synchronous boot gate, other routes, reduced motion, failure escape, local assets and timeline ordering. The opening poster was refreshed from the new crowd scene. Production build and responsive browser QA should be rerun after adding content. PostgreSQL, SMTP and Turnstile still need live integration testing with deployment credentials; local tests do not certify these external services. No Lighthouse score is claimed.
