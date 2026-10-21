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

COPY y8-premier/ ./y8-premier/

ARG VITE_Y8_APP_URL=https://y8-web-jason-sprouse.fly.dev
ARG VITE_Y8_SERVER_URL=https://y8-server-jason-sprouse.fly.dev/api/v1
ENV VITE_Y8_APP_URL=$VITE_Y8_APP_URL
ENV VITE_Y8_SERVER_URL=$VITE_Y8_SERVER_URL

WORKDIR /app/y8-premier
RUN npm run build

# ─── Production stage ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages     ./packages
COPY --from=builder /app/y8-premier   ./y8-premier

WORKDIR /app/y8-premier
EXPOSE 3002
CMD ["node", "dist/server.cjs"]
