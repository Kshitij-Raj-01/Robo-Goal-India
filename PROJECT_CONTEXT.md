# Robo Goal India and Robotic Sir Project Context

Last consolidated: 27 October 2026 (Asia/Kolkata)

Backend/CMS revision in progress: Django in `backend/` manages published events, gallery WebP uploads, fixtures, contact settings, five homepage counts, and scheduled Markdown blogs. `/admin` redirects to `/cms-admin/`; the older bearer-protected enquiry workflow remains at `/enquiries-admin`. Next.js reads CMS content at request time with a server-only adapter and shared render context. Public blog routes include canonical/SEO metadata, sanitized HTML, BlogPosting JSON-LD and dynamic sitemap entries. No refund policy is linked or routed while payments are absent. Privacy/terms drafts are present but production forms remain gated by `POLICIES_APPROVED`. Form limits use shared PostgreSQL counters with an early trusted-proxy IP bucket plus an email bucket. Docker Compose packages Django/Gunicorn, Next/enquiries, PostgreSQL, migration/static init jobs and Nginx. See DEPLOYMENT.md for launch requirements and actual verification status. Intro playback is first homepage entry per tab only, not client Back/Forward navigation.

Latest opening adjustment: remove the standalone rolling-ball lead-in. The first visible animation is the bot's run-up and kick, followed by its full-screen robotics-parts burst. A dark cover hides preparation without exposing the homepage. Preparation now has an eight-second safety cap, superseding the older 3.5-second notes below; playback remains 12.3 seconds.

Latest revision: the prepared sequence now lasts 12.3 seconds. A goal at 2 seconds triggers a full-viewport hardware cloud at 2.7 seconds. The actual scored Three.js ball is reparented without changing its world pose into a transparent two-mesh foreground layer at 5.2 seconds; it remains visible over the descending navy curtains and lands precisely at the logo football coordinates at 7.8 seconds. Existing logo artwork assembles around it, crossfades the ball into the exact wordmark, then disperses before the curtains open. Cyan/gold light sweeps, gold trim and decorative party speckles illuminate navy fabric. No new raster assets were generated. Local electronics cutouts and native hardware helpers are active again. Stadium rendering stops once covered; the ball layer stops after the logo handoff. One GSAP clock drives both. Preparation remains capped at 3.5 seconds, playback at 16 seconds and bootstrap at 22 seconds. Earlier descriptions below are historical.

Latest animation update, 27 October 2026 (supersedes the older intro descriptions below): a 4.6-second goal/celebration transitions to vermilion/crimson curtains with saffron folds, metallic-gold trim and a bounded gold light sweep. A football rolls into the GOAL O, followed by nine clipped slices assembling the existing transparent dark-theme logo. After a brief readable settle, the wordmark disperses and the curtains open to the homepage. Electronics scattering and the bot-through-logo ending are removed; old cutouts/helpers remain unused and the portal module is recoverable in Git history. Rendering uses one GSAP clock and one direct WebGL pass, asynchronously prepared shaders, a batched robot body and a two-mesh stitched football. There is no environment bake, bloom, shadow map or second 3D scene. GPU drawing stops behind the closed curtain. Preparation is capped at 3.5 seconds and playback at six seconds; first-paint gating and accessibility/failure fallbacks remain. No new logo image was generated for this change.

Implementation update, 26 October 2026: the dedicated website uses the official transparent Robotic Sir wordmark at `public/images/robotic-sir-logo.webp`, with public contact data in `src/lib/content.ts`. Website text is at least 18px, preserving larger headings. The homepage and About image now use the real `rgi-action-2.jpg` event photograph from the related repository, optimized as `public/images/robo-goal-event.webp`. The illustrative animated bot is rebuilt around the event photos' sheet-metal scoops, low chassis, perforated rubber tyres, taped battery and exposed electronics. The latest 8.6-second opening adds 250 animated cheering spectators and an expanded scatter of rendered ESP32, Arduino, battery and driver cutouts plus native 3D wheels, motors, gears, servo, sensor, capacitors, MOSFETs, connectors, cables and fasteners. White/light-orange curtains display the supplied logo unchanged. The bot emerges through the football O in GOAL before the curtain opens. The component cutouts were generated with imagegen, not photographed or downloaded from Sketchfab. The coded sequence uses a synchronous head visibility gate to prevent a homepage flash, plus reduced-motion, no-JavaScript and failure fallbacks. No skip, audio or replay controls are shown. This supersedes the collision intro and generated stadium hero.

Latest hero/branding update, 26 October 2026: at the user's request, the homepage hero now uses a realistic dark-theme CGI illustration based on BOTH newly uploaded event photos, delivered as `public/images/robo-goal-hero-cgi.webp`. Its camera drifts once for five seconds after the intro gate and respects reduced motion. It is not real event photography or a video. About, the soccer card and social preview retain the genuine event photograph. Shared `Brand` and `OrganizerLogo` placements now use transparent dark-theme wordmark adaptations, with white main lettering, retained colored emblems and no white rectangular plates. Source logos and the exact white-background curtain logo remain untouched. The derivatives are `robo-goal-india-logo-dark.webp` and `robotic-sir-logo-dark.webp`; prompts and generation provenance are in `public/images/HERO_BRANDING_PROMPTS.md`. This supersedes the earlier real-photo homepage hero and temporary CSS website wordmark.

This file is the durable working context for agents and contributors working on the Robo Goal India website. It consolidates verified material from this repository, the related `Robotic-Sir-Community` repository, and the associated Codex project chats.

It is context, not a substitute for checking current source data. When this file conflicts with current code, the approved CMS/API record, an organizer-approved document, or a newer written user instruction, use the newer authoritative source and update this file.

## 1. Non-negotiable content rules

- Use English for website copy and project communication unless the user explicitly asks for another language.
- Be factual and direct. Do not invent attendance numbers, impact statistics, partners, sponsors, winners, judges, venues, dates, cities, testimonials, team members, contact details, or results.
- Clearly distinguish among:
  - completed and verified events;
  - confirmed future events with approved dates and venues;
  - proposals, tour concepts, or future vision;
  - placeholders and development-only content.
- Never describe the proposed national Robo Goal India league as already operational.
- Never publish private participant, team-member, payment, registration, or enquiry data in public content.
- Do not copy credentials or secrets from old chats or local environment files into source control. OAuth secrets, SMTP passwords, admin tokens, payment keys, and similar values belong only in private environment configuration. Any credential pasted into a chat should be treated as exposed and rotated.
- Publish only organizer-approved legal policies, rulebooks, fees, registration links, and refund terms.
- Prefer the canonical URLs `https://roboticsir.com` and `https://robogoalindia.com` in public-facing references.

## 2. Organization and brand relationship

### Robotic Sir

- Public brand: **Robotic Sir**.
- Legal/organizing entity used by the websites: **Robotic Sir AI India Pvt. Ltd.** (some structured data omits the final period; keep the presentation consistent within a document).
- Main website: `https://roboticsir.com`.
- Positioning: an India-based robotics, artificial intelligence, programming, electronics, and STEM learning platform centered on practical, hands-on projects.
- Community positioning: students, developers, mentors, makers, professionals, and technology enthusiasts learn by building projects, participating in workshops and competitions, receiving technical guidance, sharing work, and developing portfolios.
- Public site description: a robotics and AI learning platform with projects, events, competitions, mentorship, and hands-on learning in India.
- Main areas of work:
  - robotics, electronics, programming, AI, machine learning, and automation education;
  - project-based courses and learning resources;
  - offline laboratories and guided practice;
  - workshops, exhibitions, webinars, competitions, and innovation challenges;
  - institutional and brand collaborations;
  - community membership and member portfolios;
  - robotics products, kits, and marketplace/store activity;
  - mentoring, judging, career awareness, and responsible innovation.

### Robo Goal India

- Public brand: **Robo Goal India**.
- Website: `https://robogoalindia.com`.
- Organizer and parent organization: **Robotic Sir AI India Pvt. Ltd.**
- Positioning: an Indian robotic-sports initiative bringing students, schools, universities, and technology communities together through robot soccer, robot racing, engineering challenges, and a structured competition pathway.
- Robo Goal India is an event/competition property of Robotic Sir, not a separate unrelated company.
- Current website headline/tagline: **Build. Compete. Conquer.**
- The 2026 event sponsorship copy also used **Build. Compete. Innovate.** Preserve the correct line for the specific source or campaign rather than silently mixing them.

## 3. Founder and organizational voice

### Founder

- Name: **Piyush Bafna Jain**.
- Role: **Founder & CEO, Robotic Sir AI India Pvt. Ltd.**
- Approved founder quote currently used on the Robotic Sir website:
  > We are not just building machines, we are building the innovation backbone of modern technology where real ideas meet real execution.
- Approved profile image reference in the Robotic Sir frontend: `/image 2 (1).png`.
- Do not replace the founder's name with shortened or reordered variants without approval. Some historical content says “Piyush Jain Bafna”; the current About data uses “Piyush Bafna Jain.”

### Mission themes

- Make robotics and AI practical and accessible to creators.
- Help students and professionals turn complex ideas into working outcomes.
- Teach through projects, experimentation, mentorship, and collaboration.
- Connect classroom curiosity to engineering practice, competitions, portfolios, and real-world problem solving.
- Build an Indian ecosystem for robotics, AI, intelligent hardware, responsible technology, and future skills.

### Tone

- Confident, energetic, technical, and youth-facing.
- Practical rather than theoretical: emphasize designing, building, programming, testing, competing, and demonstrating.
- Ambitious without making unsupported “largest,” “best,” “first,” national-scale, or impact claims.
- Use plain language. Explain technical ideas without unnecessary jargon.
- Avoid generic corporate filler and exaggerated claims.

## 4. Robotic Sir visual identity and logo

### Official Robotic Sir wordmark

The available approved-looking Robotic Sir wordmark is a wide horizontal mark:

- black uppercase `ROBOTIC SIR` lettering;
- both `O` letters rendered as concentric circular/ring forms using orange and blue;
- the `T` is stylized as a black robotic gripper/claw;
- a small `TM` mark appears at the upper-right;
- the inspected version sits on a white background.

Reference asset copies in the related repository include:

- `C:\Users\hs\Desktop\Robotic-Sir-Community\tmp\rgi-tour-proposal\assets\robotic-sir-logo.png`
- `C:\Users\hs\Desktop\Robotic-Sir-Community\tmp\school-proposal-ltf\assets\robotic-sir-logo.png`

The Robotic Sir frontend refers to `/Main logo-transparent.png` for the navbar and `/Main logo.png` for organization structured data. Those named files were not present in the inspected local `frontend/public` directory, so confirm the production/static-media source before copying or replacing them.

### Brand colors

- Primary orange used throughout the Robotic Sir interface: `#ff7a00`.
- Primary dark/navy text and panels: `#111827` and `#0f172a`.
- White and light gray are the principal light-theme surfaces.
- Blue is a secondary accent visible in the official wordmark and selected gradients.
- The orange, blue, black, and white combination should remain recognizable across Robotic Sir material.

### Logo rules

- Use the official transparent logo on colored or dark surfaces when available.
- Do not use the white-background logo directly on a dark theme without an intentional light container or an approved white/transparent variant.
- Preserve aspect ratio and clear space; do not stretch, crop, recolor, or redraw the mark casually.
- Partner and sponsor logos must use contain fitting and must not be distorted.
- The supplied Robo Goal India wordmark and sourced Robotic Sir wordmark replace the temporary header/footer concepts. Transparent dark-theme adaptations are used at the user's request; retain originals as master references. The code-native favicon remains a website concept.
- Do not claim that AI-generated concept artwork is a photograph of a real event.

## 5. Public Robotic Sir contact and locations

These details are public in the related website source. Reconfirm them before a production launch or printed campaign.

### Delhi centre / head office

- Address: Robotic Sir, F-24, near Preet Vihar Metro and TATA Westside, Metro Pillar 95, above Zevar Mahal, Preet Vihar, New Delhi, Delhi 110092.
- Public phone: `+91-8294579554`.

### Noida centre

- Address: Robotic Sir, Spectrum Metro, BF-74, Tower B, First Floor, Phase 2, Sector 75, Noida, Uttar Pradesh 201316.
- Public phone: `+91-9267913431`.

### General contact and social channels

- Email: `ai@roboticsir.com`.
- YouTube: `https://youtube.com/@roboticsirofficial`.
- Facebook: `https://www.facebook.com/roboticsir/`.
- Instagram: `https://www.instagram.com/roboticsir_official/`.
- Published visiting hours in the location data: Monday-Sunday, 10:00-22:00. The website tells visitors to call before travelling and to confirm current batches, fees, and availability.

## 6. Robo Goal India product and event concept

### Core experience

- Main disciplines currently presented by the dedicated website:
  - Robo Soccer;
  - Robo Race.
- Skills emphasized: robotics, electronics, programming, mechanical design, strategy, teamwork, and problem solving.
- Core audiences: students, schools, colleges, universities, technology communities, sponsors, and institutional hosts.
- Host value proposition: hands-on STEM engagement, campus visibility, structured competition, event promotion, progression opportunities, and long-term community building.
- Sponsor value proposition: youth-facing brand visibility, student engagement, event branding, digital promotion, on-ground activation, product demonstrations, and association with practical technology education.

### Proposed national competition pathway

The dedicated site presents this as a future pathway, not a completed nationwide league:

1. Campus Rounds — initial institution-level building and competition.
2. City Qualifiers — qualified campus teams compete at city level.
3. Regional Rounds — city qualifiers represent their areas.
4. National Qualifiers — proposed national qualification stage.
5. National League — long-term future vision for Indian robotic sport.

Eligibility, team counts, qualification criteria, venues, and regulations remain “to be announced” unless an approved rulebook or confirmed fixture says otherwise.

### Supported content categories

- Events and results.
- Fixtures and tour map.
- Robo Soccer and Robo Race galleries.
- Teams, robots, standings, judges, awards, and behind-the-scenes content.
- Campus hosting, sponsorship, partnership, and general enquiries.
- Competition rules, privacy, terms, and refund documents.

## 7. Robo Goal India 2026 — verified competition record

Status note: the related competition export was captured before the event and still labelled the event “upcoming.” Later SEO content describes it as completed. Because the scheduled date was 27 September 2026 and the current consolidation date is 26 October 2026, treat it as a historical event, but publish results, attendance, and winners only from an approved final record.

- Title: **Robo Goal India 2026**.
- Format: arena-based robotic soccer championship.
- Organizer: Robotic Sir AI India Pvt. Ltd.
- Championship date: **27 September 2026**, 9:30 AM-6:00 PM.
- Venue stated in the competition description: **Dome Area, Spectrum Metro Mall, Phase 2, Sector 75, Noida, Uttar Pradesh**.
- Workshop date: **20 September 2026**.
- Official practice date: **26 September 2026**.
- Historical registration fee: **₹2,500 per team**.
- Team size: **1-3 members**.
- Match structure: **1 vs 1 qualifying matches**, followed by a **3 vs 3 championship final**.
- Participant focus: young innovators, students, robotics enthusiasts, and teams using self-built robots.
- Learning focus: robot design, control, engineering, strategy, speed, teamwork, creativity, and problem solving.
- Recognition described in the event material: cash prizes, championship trophies, merit and participation certificates, special awards, and robotics goodies.
- Published sponsor in the captured competition record: **Newton School of Technology**, tier **Powered By**.
- Published rulebook existed in the related platform's media storage. Use the current approved rulebook URL/asset rather than copying an old snapshot blindly.
- Volunteer programme material mentioned certificates, volunteer T-shirts, performance-based robotics goodies, Spark-E kits, ambassador points, and event-team experience. Treat eligibility and benefits as historical unless reconfirmed for a new edition.

Do not transfer historical registration-open states, deadlines, fees, sponsor commitments, or volunteer benefits to a future edition without approval.

## 8. Innovation India 2026 — verified competition record

- Title: **Innovation India 2026**.
- Type: free national hardware innovation competition for school students.
- Organizer/platform: Robotic Sir.
- Event date: **26 September 2026**, 9:00 AM-5:30 PM.
- Venue: **Dome Area, Spectrum Metro Mall, Phase 2, Sector 75, Noida, Uttar Pradesh**.
- Audience: school students in Classes 8-12, aged 13-18 on the event date.
- Entry: individual or teams of up to five students.
- Historical fee: free.
- Required character: every submission needed a meaningful physical or hardware component; pure software submissions were not eligible.
- Track A: hardware prototype with photographs and a public demonstration video; optional supporting document/pitch deck.
- Track B: hardware idea with a PDF/PPT/PPTX pitch deck describing the problem, proposed solution, architecture/schematic, impact, and indicative bill of materials.
- Evaluation themes: problem relevance and impact, feasibility, hardware engineering, innovation, originality, presentation, and the team's understanding.
- Historical recognition: first prize ₹5,000; second ₹3,500; third ₹2,500; plus a special award.
- Category areas included agriculture, healthcare, smart living, cybersecurity hardware, education hardware, climate technology, aerospace, financial-inclusion hardware, social impact, biomedical devices, disaster management, mobility/EV, circular economy, energy systems, industrial automation, autonomous robotics, secure hardware, inclusive learning hardware, and retail/kiosk automation.

Do not reopen registration, reproduce deadlines, or advertise historical prizes for another edition without approval.

## 9. Other published Robotic Sir competitions

These records came from the related platform's published competition export. Verify final results and detail-page content before republishing.

| Date | Competition | Context |
|---|---|---|
| 30 Mar 2025 | Test Your Code | One-day coding competition at the Robotic Sir Delhi Centre covering debugging, logic, programming, and problem solving. |
| 27 Nov 2025 | Line-X National Robotics League 2025 | Autonomous line-following robotics championship emphasizing speed, precision, and sensor calibration. |
| 6-7 Dec 2025 | National Robotics League 2025 | Seven Robotic Sir students were recorded as selected for the IIT Bombay championship; the published summary says they showcased two original prototypes. |
| 14 Jun 2026 | Sumo Wars: First Edition 2026 | Robotic Sir autonomous sumo competition focused on chassis design, motor torque, sensing, and arena strategy; the published summary names Team Kronos as the winner. |
| 12-13 Jul 2026 | Robotex India National Robotics Championship 2026 | A published 21-member Robotic Sir delegation competed at MIT-ADT University, Pune; the summary records third position on Day 1 in the Advanced Entrepreneurship Challenge. |
| 26 Sep 2026 | Innovation India 2026 | Free school hardware innovation competition in Noida. |
| 27 Sep 2026 | Robo Goal India 2026 | Robot soccer championship in Noida. |

## 10. Published Robotic Sir events and workshops

The following 22 items were present in the captured published-event export. Use the canonical detail page and current API/CMS record for full copy, images, and final status.

| Date | Event | Venue/location | Published focus |
|---|---|---|---|
| Date not recorded | Lucknow Robotics Session | Robotic Sir Learning Session, Lucknow | Interactive robotics learning session. |
| 12-13 Jan 2025 | Two-Day Robotic Show Event at DME Noida | Delhi Metropolitan Education, Noida | Live robotics/electronics demonstrations and practical hardware learning. |
| 29 Jan 2025 | JIIMS Robotics Session | JIIMS, Noida | Humanoid, Rubik's Cube solver, obstacle avoidance, robotic arm, AI/automation, and careers. |
| 24 Feb 2025 | Robotic Sir Exhibition at DCAC Delhi | Delhi College of Arts and Commerce, New Delhi | Robotics trends, automation, intelligent hardware, and future skills. |
| 4 Mar 2025 | Parent Awareness Session on AI, Robotics and Electronics | Robotic Sir Delhi Centre | STEM education, responsible technology, careers, and hardware learning. |
| 10-12 Mar 2025 | IIT Robotics Exhibition | IIT Delhi, New Delhi | Live robotics demonstrations for visitors and invited guests. |
| 28-29 Mar 2025 | Robotic Exhibition at Hansraj College | Hansraj College, University of Delhi | Robotics demonstrations, interdisciplinary career guidance, AI, automation, software, and electronics. |
| 1 Apr 2025 | E-Summit at SGGSC | Sri Guru Gobind Singh College of Commerce, Pitampura | Robotics show, startups, and technology careers for commerce students. |
| 8 Apr 2025 | TEDx Kirori Mal College Robotics Exhibition & Humanoid Robot Presentation | Kirori Mal College, University of Delhi | Robotics innovations, humanoid demonstration, AI, robotics, and digital media. |
| 19-20 Apr 2025 | AI Flood Workshop 2.0 | Venue not recorded in the export | Generative AI, agentic AI, automation, visualization, Web3, and Industry 5.0. |
| 9-10 May 2025 | Robotic Sir AI Showcase at Galgotia Techfest | Galgotias University, Greater Noida | Interactive lecture plus humanoid, power-station, refrigerator, and robotic-arm demonstrations. |
| 26-29 Jun 2025 | Robo Ranger 4-Day Robotics & Arduino Workshop | Robotic Sir Delhi Centre | Electronics, TinkerCAD, Arduino, sensors, motor control, autonomous robotics, projects, and VIREX. |
| 27-29 Jun 2025 | Robotics Summer Champ Workshop | Terapanth Bhawan, Krishna Nagar | STEM for children, humanoids, indoor drones, electronics, paper robotics, and practical learning. |
| 30 Jul 2025 | Industry 5.0 in Our Surrounding Webinar | Maharaja Surajmal Institute of Technology, Delhi | Human-AI collaboration and intelligent automation. |
| 16 Aug 2025 | Janmashtami Robotic Exposure Event & Tech Showcase | Kabul Line, Delhi Cantt | Public robotics exposure and technology showcase. |
| 4-5 Oct 2025 | MAIMS Robotic Stageshow and Futuristic AI & Robotics Workshop | Maharaja Agrasen Management Institute, Delhi | Humanoids, computer vision, obstacle avoidance, robotic arms, and future technology. |
| 1-2 Nov 2025 | Robo Ranger 2.0 Workshop | Robotic Sir Delhi Centre | Two-day hands-on robotics workshop. |
| 3 Nov 2025 | Pitch Your Idea Summit 3.0 | Maharaja Agrasen Institute of Technology, Rohini | Student startup/technology pitches; Piyush Jain Bafna was listed on the expert panel in the historical summary. |
| 8-10 Nov 2025 | Robotics & Automation Global Competitiveness Awareness Drive | ASPAM International School, Noida | K-12 progression across robotics, electronics, programming, automation, ROS, and AI. |
| 29-31 Dec 2025 | Three-Day AI Flood Workshop | Robotic Sir Delhi Centre | Prompt engineering, generative AI, multimedia, Power BI, automation, and AI business applications. |
| 16-20 Feb 2026 | India AI Impact Summit 2026 participation | Bharat Mandapam, New Delhi | Robotic Sir participation; the published summary mentions founder Piyush Bafna Jain and the Elementorium concept. |
| 12 May 2026 | National AI & Robotic Educational Summit 2026 | Etawah Convention Hub, Etawah | Rural and tier-2/tier-3 STEM access; the published summary describes a drive for 500+ school innovation labs. Treat the “500+” figure as an announced objective, not a completed outcome. |

### Additional event/campaign context found in related work

- **Lead To Future**: a Robotic Sir/SEVA First workshop and school-engagement concept represented in proposal and speaker-deck artifacts. Treat dates, host commitments, collaborators, and deliverables as proposal-specific until confirmed.
- **GDG Noida DevFest 2026**: related work describes Robotic Sir as an event sponsor/partner with robot and humanoid demonstrations, a participant Robot Race, a robotics booth, and an AI × Hardware talk at ExpoInn, Greater Noida. This item was found in later worktree/artifact context rather than the 23 September published-event export; verify it against the current live site and official GDG Noida source before presenting it as canonical.
- **UP Robotics & Emerging Technology Summit 2027**: a funding/proposal document exists. It is a proposal, not evidence that the summit is approved, funded, or scheduled.
- **Robo Goal India Tour**: proposals and a tour flyer exist. The nationwide campus-to-national pathway remains a strategic concept until individual cities, hosts, dates, and registrations are officially confirmed.

## 11. Published Robotic Sir project portfolio

The related platform export includes these projects. Project names and claims should be checked against their canonical detail pages before reuse:

- MK-4 Merkava — armored unmanned ground vehicle concept.
- LEO (Learning Electronic Objective) — DIY teaching robot with custom PCB, OLED face, audio, and AI functionality.
- Puding — AI-powered humanoid intended for interactive learning and assistance.
- Portable Power Station — custom multi-cell portable energy system.
- VIREX — locally described as “Johnny: Local AI Assistant Robot.”
- Raspberry Pi Game — single-button retro gaming console built with Raspberry Pi/Arduino elements.
- 4-Axis Robotic Arm — direct hardware-controlled arm without an MCU in the published summary.
- ESP32-Based Satellite Clock — ESP32 time system using satellite-derived precision.
- Leonardo-Based Digital Calculator — custom designed/printed/programmed calculator.
- Relay Bomb — embedded programming and relay-switching demonstration; avoid sensational wording in public educational copy and emphasize safety.
- Portable Air Quality Meter — Arduino Pro Mini and MQ-135 portable monitor.
- Logic Pet — electronics-based pet robot using circuit logic rather than a microcontroller.
- Bumble Bee — high-speed wireless sumo robot using ESP-NOW and BTS7960 motor control.
- Custom-Built 50cc 2-Stroke Dirt Bike — custom mini-bike engineering project.
- Volt — wireless sumo robot with dual ESP32 design and fail-safe transmitter.

## 12. Collaboration and partnership model

Robotic Sir and Robo Goal India accept collaboration enquiries for:

- institutional robotics, AI, and innovation workshops;
- campus competitions and innovation challenges;
- event outreach, registration, mentoring, judging, and participant engagement;
- brand sponsorship and technology partnerships;
- school/college programmes and laboratory initiatives;
- guest sessions, webinars, exhibitions, and live demonstrations;
- community, venue, media, equipment, and campus partnerships.

Robo Goal India sponsor-tier concepts in the dedicated site include Title Partner, Presented By, Powered By, Technology Partner, Education Partner, Venue Partner, Community Partner, Media Partner, Equipment Partner, and Campus Partner. These are package concepts, not proof that a sponsor currently occupies each tier.

## 13. Website and repository architecture

### Current repository: `Robo-Goal-India`

- Purpose: dedicated `robogoalindia.com` experience.
- Stack: Next.js 16.4.3 App Router, React 19, TypeScript, GSAP, Three.js, Zod, and a Node-compatible backend layer inside Next.js route handlers.
- Before changing Next.js code, read the relevant installed guide in `node_modules/next/dist/docs/`; this version contains breaking changes relative to older Next.js knowledge.
- Main content source: `src/lib/content.ts`.
- Main public routes:
  - `/`, `/about`, `/tour`, `/events`, `/fixtures`, `/gallery`;
  - `/partners`, `/sponsors`, `/leaderboard`, `/teams`, `/robots`;
  - `/collaborate`, `/contact`;
  - data-driven detail pages for events, teams, and robots;
  - legal/document routes and a restricted admin enquiry interface.
- The current content arrays for events, fixtures, media, partners, sponsors, teams, robots, judges, and announcements are intentionally empty. They are not permission to invent demo data.
- The current national-tour map uses an organizer-supplied image at `public/maps/india-organizer.png`; it is not an authoritative political map.
- The old stadium concept assets are retained, but the current hero is a genuine event photograph from the related Robotic Sir repository. The 3D intro remains an illustrative recreation based on those bots, not documentary footage.
- The site includes a cinematic procedural robot/football intro. It should remain skippable, reduced-motion aware, and lightweight on constrained devices.

### Related repository: `Robotic-Sir-Community`

- Purpose: the broader `roboticsir.com` platform.
- Frontend: Next.js application under `frontend/`.
- Backend: Django application under `backend/` with public content, competition registration, memberships, learning, community, store, administration, payments, certificates, passes, and email workflows.
- The related platform is the stronger source for Robotic Sir organizational data, public event history, competition records, founder data, contact details, locations, courses, memberships, and project showcases.
- Do not directly couple the two repositories or duplicate live operational data without an approved integration plan. Prefer a validated API/CMS adapter if Robo Goal India needs canonical data from the Robotic Sir platform.

## 14. Robo Goal India website behavior and safety requirements

- Public records must be CMS/API-ready and validated.
- Unpublished slugs should return 404.
- Event schema/JSON-LD must be added only for verified events.
- Registration buttons should appear only when a confirmed registration URL and approved status exist.
- No paid registration flow is currently implied by the dedicated site's collaboration form.
- Production enquiries require approved Terms and Privacy content and configured anti-bot verification.
- Attachments must remain private, size/type/signature validated, and protected from inline public execution.
- Admin actions require server-verified authentication and same-origin checks for writes.
- CSV/Excel exports must neutralize spreadsheet formula injection.
- Email delivery uses an outbox model; a queued record is not proof of inbox delivery.
- Do not expose applicant personally identifiable information in analytics.
- Preserve keyboard access, visible focus, reduced-motion support, mobile responsiveness, and dark/light contrast.

## 15. Relevant decisions imported from Robotic-Sir-Community chats

These are working requirements or historical findings, not automatic requirements for the dedicated Robo Goal India site. Verify scope before implementing them here.

### Membership and dashboard direction

- Free and Basic users should receive profile access rather than full dashboards.
- Beginner, Intermediate, and Pro members should have role-appropriate dashboards.
- Paid profiles should support shareable public-profile behavior and profile photographs.
- Intermediate/Pro requirements included membership/renewal data, payment methods/history, and participation history.
- Beginner requirements additionally included titled video lectures and learning progress.
- Pro requirements additionally included broader opportunity/job access and competition performance.
- Existing free-registration data should prefill later membership registration, and already verified email addresses should not be challenged or rejected merely because the same address is reused.
- Registered users should not continue seeing a misleading sign-up option.
- “Quick Lab Access” was to become “Request Lab Access” and route to an enquiry flow.
- The broader Robotic Sir site is expected to be mobile responsive and fully legible in light and dark themes, with consistent typography and approved logo treatment.

### Authentication and secrets

- Google login was requested for the broader platform.
- Client secrets must never be committed to this file or source code. Configure OAuth values through private environment variables and rotate any secret previously pasted into chat.

### Email reliability finding

- A prior inspection found overlapping retry mechanisms in the broader Robotic Sir backend: automatic task retries and periodic requeue jobs could produce multiple concurrent retry chains for one email.
- Historical admin records showed individual messages reaching unusually high attempt counts.
- Gmail also returned a daily sending-limit error during that incident.
- The recommended architecture was one controlled retry mechanism with processing locks/idempotency and a `next_attempt_at`-style schedule.
- This was a diagnosis, not confirmation that the production fix was completed. Reinspect current code before assuming the issue still exists or is resolved.

### Related deliverables created in prior chats

- Lead To Future / SEVA First workshop presentations and school proposals.
- UP Robotics & Emerging Technology Summit 2027 funding proposal.
- Robo Goal India and Innovation India participant/team spreadsheets.
- Competition certificates, passes, invitations, judging sheets, sponsor dossiers, and tour proposals.
- These artifacts provide design and historical context but do not override current approved website records.

## 16. Data provenance and freshness

Primary sources inspected for this consolidation:

- `Robo-Goal-India/README.md`
- `Robo-Goal-India/src/lib/content.ts`
- `Robo-Goal-India/public/ASSETS.md`
- `Robotic-Sir-Community/frontend/src/data/about.ts`
- `Robotic-Sir-Community/frontend/src/data/contact.ts`
- `Robotic-Sir-Community/frontend/src/data/locations.ts`
- `Robotic-Sir-Community/frontend/src/data/competitionSeo.ts`
- `Robotic-Sir-Community/frontend/src/data/eventLocationHubs.ts`
- `Robotic-Sir-Community/frontend/src/lib/seo.ts`
- `Robotic-Sir-Community/frontend/public/llms.txt`
- Captured published-content exports `.codex_ppt_events.json`, `.codex_ppt_competitions.json`, and `.codex_ppt_projects.json` from 23 September 2026.
- Five Codex chats grouped under the `Robotic-Sir-Community` project, covering website/dashboard work, workshop material, funding proposals, school proposals, and registration spreadsheets.

Freshness warnings:

- The captured event/competition exports are historical snapshots and may contain pre-event statuses.
- Public contact details, hours, prices, registration states, sponsor relationships, and URLs can change.
- Before publishing a time-sensitive claim, check the current Robotic Sir API/CMS, canonical website page, or an organizer-approved document.
- When adding a verified fact, add its source path or canonical URL near the relevant section and update the “Last consolidated” date.

## 17. Checklist for future agents

Before making a content or product change:

1. Read `AGENTS.md` and this file.
2. Determine whether the task concerns the dedicated Robo Goal India site or the broader Robotic Sir platform.
3. For Next.js changes, read the relevant installed Next.js documentation first.
4. Identify whether each claim is verified history, a confirmed future event, or a proposal.
5. Check current source data before repeating dates, prices, venues, sponsors, results, addresses, or contact details.
6. Use approved logos and real media; label concept art accurately.
7. Keep secrets and personal data out of source control and public collections.
8. Preserve accessibility, responsiveness, theme contrast, security checks, and existing working flows.
9. Run tests and visual checks proportional to the change.
10. Update this file when a material brand, event, architecture, or business decision changes.
