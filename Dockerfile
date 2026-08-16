# Multi-stage Dockerfile for TanStack Start Application

# --- Stage 1: Build ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json bun.lock* bunfig.toml* ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Build application for production
RUN npm run build

# --- Stage 2: Production Runtime ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy built application and required production dependencies
COPY --from=builder /app /app

EXPOSE 3000

# Start server using node on Nitro output if present, or npm preview
CMD ["sh", "-c", "if [ -f .output/server/index.mjs ]; then node .output/server/index.mjs; else npm run preview; fi"]
