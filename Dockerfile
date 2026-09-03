# Production Dockerfile for Railway / Container hosting
FROM node:20-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update -y && apt-get install -y openssl python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy root and package manifests
COPY package.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN npm --prefix server install
RUN npm --prefix client install

# Copy application source
COPY . .

# Build Client static assets
RUN npm --prefix client run build

# Setup Database & Seed
RUN npx --prefix server prisma db push --schema=server/prisma/schema.prisma
RUN npx --prefix server tsx server/src/seed.ts

# Set Environment & Expose Port
ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

# Start unified server
CMD ["npx", "--prefix", "server", "tsx", "server/src/index.ts"]
