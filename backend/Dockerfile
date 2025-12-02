# Multi-stage build for production-ready NestJS application
# Stage 1: Build stage - Compile TypeScript to JavaScript
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /build

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build tools)
RUN npm ci

# Copy source code
COPY . .

# Build the application (compile TypeScript to dist/)
RUN npm run build

# Stage 2: Production stage - Minimal runtime image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dumb-init for proper signal handling (PID 1 process)
# This ensures that signals like SIGTERM are properly forwarded to Node.js
RUN apk add --no-cache dumb-init

# Set Node environment to production
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install only production dependencies (no devDependencies)
RUN npm ci --only=production && npm cache clean --force

# Copy compiled application from builder stage
COPY --from=builder /build/dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Change ownership of app directory
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose application port
EXPOSE 3000

# Health check - validates that the application is running
# Checks if the Swagger UI is accessible
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/docs', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/main.js"]
