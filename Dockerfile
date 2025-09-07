# Use official Node LTS image
FROM node:20-bullseye-slim

# Install required packages for Chromium
RUN apt-get update && apt-get install -y \
  ca-certificates fonts-liberation libatk1.0-0 libatk-bridge2.0-0 libc6 \
  libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 \
  libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 libnss3 \
  wget gnupg --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Install Chromium via package manager
RUN apt-get update && apt-get install -y chromium --no-install-recommends || apt-get install -y chromium-browser --no-install-recommends || true

WORKDIR /app

# Copy package manifests first for better caching
COPY package*.json ./

# Install dependencies (including dev deps for build)
RUN npm ci

# Copy the rest of the sources
COPY . .

# Build the Next.js app
ENV NODE_ENV=production
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN npm run build

# Remove devDependencies to slim image
RUN npm prune --production

EXPOSE 3000

# Start the Next.js production server
CMD ["npm", "start"]
