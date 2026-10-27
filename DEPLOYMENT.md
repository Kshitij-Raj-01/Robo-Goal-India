# RGI deployment and operations

The repository now contains a Next.js web/enquiry service, Django CMS/admin,
PostgreSQL and Nginx. Docker Compose packages all services. This is a single-host
baseline, not evidence of a production penetration test or measured capacity.

## What the admin controls

- `/admin` redirects to `/cms-admin/`: Django staff login, individual accounts,
  model permissions, audit logging, CSRF protection and login-attempt lockout.
- Site settings: contact email, two phone numbers/addresses, hours, map link and
  all five homepage counts. Leave a count blank for “Coming into play”; zero is real.
- Events: draft/published records, dates, results, cover and registration link.
- Gallery: category, caption, alternative text and related event. Publication
  requires the administrator to confirm image/participant permissions.
- Fixtures: stage, city, date, status, registration and map coordinates.
- Blogs: Markdown toolbar, publication scheduling, author, excerpt and SEO fields.
  Public output is sanitized; raw scripts, unsafe URL schemes and HTML handlers
  are not allowed. Drafts and future-dated posts are excluded from the website.
- Existing enquiries remain in `/enquiries-admin` with the existing separate
  bearer-token authorization. They have **not** been migrated into Django.

All new gallery/event/blog photos are decoded and re-encoded to WebP with random
filenames, EXIF removed, a maximum 2560px edge, 10MB input and 24MP decoded limits.
JPEG, PNG, WebP, GIF, TIFF, BMP, AVIF and HEIC are supported when the pinned codecs
are present. Animation uses the first frame. SVG, malformed files and oversized
photos are rejected. This does not promise conversion of literally every format.
The media volume is a public asset store: draft image URLs should not be treated
as confidential even though their records are not listed publicly. Do not upload
sensitive/private material into this CMS.

## Production setup

1. Start Docker Desktop's Linux engine (or use Linux Docker Engine).
2. Copy `.env.docker.example` to `.env.docker`. Generate different random secrets
   for Django, rate limiting, the database and enquiry admin. Never commit this file.
   The database password must be URL-safe, or encoded in the connection URL.
3. Set the real public HTTPS URL, allowed hosts, trusted CSRF origins and Turnstile
   site key. Public Next.js settings are build-time values: rebuild after changing them.
4. Put a TLS terminator on the same host in front of `127.0.0.1:8080`. It must
   **overwrite** `X-Forwarded-Proto` and `X-Forwarded-For`. Set `TRUSTED_EDGE_CIDR`
   to its exact source address as seen by the Nginx container (Docker bridge NAT
   may change it). Never use `0.0.0.0/0`. Verify distinct clients produce distinct
   rate-limit buckets. Do not publish Django, Node or PostgreSQL ports directly.
5. Validate and build:

   ```sh
   docker compose --env-file .env.docker config --quiet
   docker compose --env-file .env.docker build --pull
   docker compose --env-file .env.docker up -d
   docker compose --env-file .env.docker exec backend python manage.py createsuperuser
   docker compose --env-file .env.docker exec backend python manage.py check --deploy --fail-level ERROR
   docker compose --env-file .env.docker ps
   ```

   Migrations run once in the `migrate` service before Gunicorn starts. Never put
   migrations in every worker's startup command. Django static assets are collected
   into the backend image and refreshed by the one-shot `static` service on deployment,
   then served read-only by Nginx. Two deliberate Django warnings remain: HSTS does
   not cover unrelated subdomains or preload the domain. Enable those only after
   confirming every subdomain is HTTPS-only; do not silently make that domain-wide change.

6. Open `/cms-admin/` through HTTPS. Create least-privilege staff users; use the
   superuser only for account/permission management. Protect admin at the TLS edge
   with an access policy or VPN and MFA. Django's password login alone is not MFA.
7. Review privacy/terms drafts against actual data providers, retention and contact
   procedures. Obtain organizer/legal approval before setting `POLICIES_APPROVED=true`.
   The refund policy is intentionally absent until payments are introduced.
8. Configure and test SMTP, Turnstile and email delivery. Enquiries can be stored
   while SMTP is unconfigured; email is not guaranteed by a receipt alone.

## Local development

Create `backend/.venv`, install `backend/requirements.txt`, then set
`DJANGO_DEBUG=true` and a local-only `DJANGO_SECRET_KEY`. Without `DATABASE_URL`,
debug mode uses SQLite; production refuses SQLite. Run:

```sh
python backend/manage.py migrate
python backend/manage.py createsuperuser
python backend/manage.py runserver 127.0.0.1:8000
```

In Next.js `.env.local`, set `CMS_INTERNAL_URL=http://127.0.0.1:8000` and
`CMS_REQUIRED=true`, then start `npm run dev`. Next's local rewrites proxy admin,
static files and media to Django. Restart Next.js after changing its environment.
When no CMS is configured, local preview still uses intentional empty records.

## Security, persistence and scaling

- Application form throttles run before body parsing, with shared PostgreSQL
  counters: 20 requests per client per 10 minutes and 5 valid submissions per
  email per hour. Nginx adds an early edge throttle. This is abuse mitigation,
  not distributed denial-of-service protection. Enable `TRUST_PROXY` only behind
  the header-overwriting private proxy. Untrusted local mode uses a conservative
  shared bucket; rotating email addresses does not bypass the client bucket.
- PostgreSQL holds CMS records, staff sessions, login lockouts and enquiries.
  Media and database volumes must be backed up separately, encrypted, and restored
  in a drill. Database backups alone do not restore gallery files.
- Keep the CMS internal JSON API private. Server components fetch request-time
  content and deduplicate reads per render; they do not share mutable global data.
  Unavailable required CMS/database services fail rather than silently publish
  fabricated data. Health endpoints report availability, not sensitive config.
- Set resource budgets and connection limits for the actual host. Load-test the
  real traffic mix before promising a user count. Bound the number and sizes of
  published items; gallery responses currently cap at 2000 and events/fixtures at
  1000. Add pagination before exceeding these editorial limits.
- For multi-host deployments, replace local media volumes with shared object
  storage and a CDN, use managed PostgreSQL/pooling, a shared load balancer and
  trusted-client-IP configuration. Reuse the same frontend build and deployment
  identifier across replicas. Never independently scale the local-volume stack
  and assume uploads or caches are shared across machines.
- Run patched dependencies/images, vulnerability scans, encrypted backups,
  access-log review, alerting and secret rotation. Do not log query strings,
  form bodies, attachments, tokens or email addresses into public logs.
- The existing email outbox retries when processed, but a durable scheduled retry
  worker is still an operational requirement if guaranteed asynchronous delivery
  is needed. A stable message ID reduces duplicates; SMTP cannot guarantee exactly-once delivery.

## Release gates

- Unit tests, Django upload/admin/security tests, TypeScript, production build.
- `npm run test:integration` reserves a fresh loopback port and temporary database,
  so it cannot accidentally test an unrelated service already listening on port 3100.
- Isolated HTTP enquiry lifecycle and throttling tests.
- Publish test CMS records and verify homepage counts/contact, events, gallery,
  fixtures, blog body/metadata/sitemap, then unpublish and verify removal/noindex.
- Desktop/mobile layout, National League alignment, race artwork and Back/Forward
  history checks. Intro is attempted only at first homepage document entry per tab.
- Docker image builds, Compose health checks, PostgreSQL migration/startup,
  TLS/CSRF, real-client-IP throttling and backup restoration in the target environment.

Do not describe unrun Docker, TLS, SMTP, load or security tests as passed.
