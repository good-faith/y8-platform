# syntax=docker/dockerfile:1
# ─── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY y8-app/package.json         ./y8-app/
COPY y8-server/package.json      ./y8-server/
COPY y8-premier/package.json     ./y8-premier/
COPY the-beach/package.json      ./the-beach/
COPY packages/                      ./packages/

RUN npm ci --legacy-peer-deps

COPY the-beach/ ./the-beach/

WORKDIR /app/the-beach
RUN npx nest build

# ─── Production stage ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages     ./packages
COPY --from=builder /app/the-beach    ./the-beach

# Entrypoint script: substitutes env-var meta tags in index.html at startup
COPY the-beach/docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

WORKDIR /app/the-beach
EXPOSE 3003
CMD ["/entrypoint.sh"]
