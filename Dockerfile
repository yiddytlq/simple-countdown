# --- base: deps + source, also the dev target (docker-compose.dev.yml uses target: base) ---
FROM node:24-alpine AS base

WORKDIR /app

RUN apk add --no-cache bash && corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . ./

# --- build: production bundle; TIMER_* stay unset so placeholders survive for runtime injection ---
FROM base AS build

RUN pnpm build

# --- runtime: static files only, no node/node_modules ---
FROM nginx:alpine-slim

# Template, not conf.d: docker-entrypoint.sh renders it per LOG_LEVEL at start,
# so nginx never loads a copy with placeholders still in it.
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/build /usr/share/nginx/html
# Pristine variables.js (placeholders intact) + injection script for container-start configuration
COPY public/variables.js /usr/share/nginx/html/variables.js
# /usr/local/bin, not /: the nginx base image ships its own /docker-entrypoint.sh,
# and copying ours to / silently overwrote it.
COPY variables.sh docker-entrypoint.sh /usr/local/bin/

EXPOSE 3000

# wget is a busybox applet already present in nginx:alpine-slim — no extra packages.
# /healthz is the one route that is not access-logged, so probing it every 30s
# does not bury the log in noise.
HEALTHCHECK CMD wget -qO- http://127.0.0.1:3000/healthz >/dev/null || exit 1

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
