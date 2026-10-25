# -------------------------------------------------------------
# Production Multi-Stage Dockerfile for Car Dealership Full-Stack
# -------------------------------------------------------------

FROM node:22-bookworm-slim AS base
WORKDIR /app

# Step 1: Install build tools for native SQLite compilation
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*

# Step 2: Copy package definitions and install all dependencies
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN npm run install:all

# Step 3: Copy source files and compile both frontend & backend
COPY backend/ ./backend/
COPY frontend/ ./frontend/
RUN npm run build

# Step 4: Production image
FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Copy root package.json and backend compiled output + dependencies
COPY package.json package-lock.json ./
COPY --from=base /app/backend/dist ./backend/dist
COPY --from=base /app/backend/package.json ./backend/
COPY --from=base /app/backend/node_modules ./backend/node_modules
COPY --from=base /app/frontend/dist ./frontend/dist

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:4000/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["npm", "start"]
