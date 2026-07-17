# --- base: deps + source, also the dev target (docker-compose.dev.yml uses target: base) ---
FROM node:22-alpine AS base

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

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
# Pristine variables.js (placeholders intact) + injection script for container-start configuration
COPY public/variables.js /usr/share/nginx/html/variables.js
COPY variables.sh docker-entrypoint.sh /

EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]
