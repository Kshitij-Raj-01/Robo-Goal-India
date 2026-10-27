FROM node:24-bookworm-slim AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS build
COPY . .
ARG NEXT_PUBLIC_SITE_URL=https://robogoalindia.com
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
RUN groupadd --gid 10001 rgi && useradd --uid 10001 --gid rgi --no-create-home rgi
COPY --from=build --chown=rgi:rgi /app/.next/standalone ./
COPY --from=build --chown=rgi:rgi /app/.next/static ./.next/static
COPY --from=build --chown=rgi:rgi /app/public ./public
RUN mkdir -p .next/cache && chown -R rgi:rgi .next
USER rgi
EXPOSE 3000
CMD ["node", "server.js"]
