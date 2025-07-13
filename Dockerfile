# Multi-stage build for optimal performance and size
FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

RUN apk add --no-cache bash

# Copy package files
COPY package*.json ./
# Install production dependencies with clean cache
RUN npm install --only=production && npm cache clean --force

# Development stage
FROM base AS dev
WORKDIR /app

# Copy package files
COPY package*.json ./
# Install all dependencies including dev
RUN npm install && npm cache clean --force

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Development command
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Build stage
FROM base AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install && npm cache clean --force

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM base AS production
WORKDIR /app

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./

EXPOSE 3000
CMD ["node", "build"]
