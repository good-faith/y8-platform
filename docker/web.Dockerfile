# syntax=docker/dockerfile:1
# ─── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root workspace manifests first (layer cache)
COPY package.json package-lock.json ./

# Copy workspace package manifests
COPY y8-app/package.json         ./y8-app/
COPY y8-server/package.json      ./y8-server/
COPY y8-premier/package.json     ./y8-premier/
COPY the-beach/package.json      ./the-beach/
COPY packages/                   ./packages/

# Install all workspace deps from root (resolves @y8/* packages)
RUN npm ci --legacy-peer-deps

# Patch @noble/hashes 1.3.x — adds sha2 + anumber missing in this version
# (pinned to 1.3.x by @scure/bip39; ox+viem nested @noble/curves needs 1.8 API)
RUN node -e "\
const fs = require('fs');\
const eu = 'node_modules/@noble/hashes/esm/utils.js';\
const u  = 'node_modules/@noble/hashes/utils.js';\
if (!fs.readFileSync(eu,'utf8').includes('anumber')) {\
  fs.appendFileSync(eu, '\nexport const anumber=(n)=>{if(!Number.isSafeInteger(n)||n<0)throw new Error(\"expected non-negative integer, got \"+n);};\n');\
  const cjs = 'Object.defineProperty(exports,\"anumber\",{enumerable:true,get:function(){return function(n){if(!Number.isSafeInteger(n)||n<0)throw new Error(\"expected non-negative integer, got \"+n);};}});';\
  fs.appendFileSync(u, '\n'+cjs+'\n');\
}\
if (!fs.existsSync('node_modules/@noble/hashes/esm/sha2.js')) {\
  fs.writeFileSync('node_modules/@noble/hashes/esm/sha2.js', 'export {sha256,sha224} from \"./sha256.js\";\nexport {sha512,sha384,sha512_256,sha512_224} from \"./sha512.js\";\n');\
  fs.writeFileSync('node_modules/@noble/hashes/sha2.js', '\"use strict\";Object.defineProperty(exports,\"__esModule\",{value:true});const s=require(\"./sha256\");const t=require(\"./sha512\");exports.sha256=s.sha256;exports.sha224=s.sha224;exports.sha512=t.sha512;exports.sha384=t.sha384;exports.sha512_256=t.sha512_256;exports.sha512_224=t.sha512_224;\n');\
  const pkg=JSON.parse(fs.readFileSync('node_modules/@noble/hashes/package.json','utf8'));\
  if(!pkg.exports['./sha2']){pkg.exports['./sha2']={import:'./esm/sha2.js',default:'./sha2.js'};fs.writeFileSync('node_modules/@noble/hashes/package.json',JSON.stringify(pkg,null,2));}\
}\
console.log('noble-hashes patched');\
"

# Copy full app source
COPY y8-app/ ./y8-app/

# Build-time NEXT_PUBLIC_* environment variables (inlined into client bundle)
ARG NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=b56e18d47c72ab683b10814fe9495694
ARG NEXT_PUBLIC_Y8_SERVER_URL=https://y8-server-jason-sprouse.fly.dev/api/v1
ARG NEXT_PUBLIC_Y8_PREMIER_URL=https://y8-premier-jason-sprouse.fly.dev
ARG NEXT_PUBLIC_THE_BEACH_URL=https://y8-beach-jason-sprouse.fly.dev

ENV NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=$NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
ENV NEXT_PUBLIC_Y8_SERVER_URL=$NEXT_PUBLIC_Y8_SERVER_URL
ENV NEXT_PUBLIC_Y8_PREMIER_URL=$NEXT_PUBLIC_Y8_PREMIER_URL
ENV NEXT_PUBLIC_THE_BEACH_URL=$NEXT_PUBLIC_THE_BEACH_URL

# Build Next.js
WORKDIR /app/y8-app
RUN npm run build

# ─── Production stage ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/y8-app/.next/standalone ./
COPY --from=builder /app/y8-app/.next/static      ./y8-app/.next/static
COPY --from=builder /app/y8-app/public            ./y8-app/public

EXPOSE 3000
CMD ["node", "y8-app/server.js"]
