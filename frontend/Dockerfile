FROM node:25.2.1-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_PUBLIC_BACKEND_URL=http://localhost
ENV NEXT_PUBLIC_FEED_URL=http://localhost/feed

CMD ["sh", "init.sh"]
# CMD ["npm", "start"]

# # Stage 1: Install dependencies
# FROM node:20-alpine AS deps
# WORKDIR /app
# COPY package.json ./
# RUN npm install
# # RUN npm ci

# # Stage 2: Build the Next.js application
# FROM node:20-alpine AS builder
# WORKDIR /app
# COPY --from=deps /app/node_modules ./node_modules
# COPY package.json ./
# COPY public ./public
# COPY src ./src
# COPY next-env.d.ts ./
# COPY tsconfig.json ./
# COPY *.mjs ./
# COPY next.config.ts ./
# RUN npm run build

# # RUN ls -a && sleep 10

# # EXPOSE 3000

# # ENV PORT 3000

# # CMD ["npm", "start"]

# # Stage 3: Production image
# FROM node:20-alpine AS runner
# WORKDIR /app

# ENV NODE_ENV production

# # Set the correct permission for the "next" user.
# # We are not using the nextjs base image, so we have to manually create the nextjs user and group.
# RUN addgroup --system --gid 1001 nodejs
# RUN adduser --system --uid 1001 nextjs

# # Change ownership of /app to nextjs user and ensure node_modules is writable
# RUN chown -R nextjs:nodejs /app

# # Copy the built application
# COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/package.json ./package.json
# COPY --from=builder /app/next.config.ts ./next.config.ts

# USER nextjs

# # Install production dependencies for the runner stage to ensure `next` is in PATH
# COPY --chown=nextjs:nextjs package.json ./
# RUN npm install

# EXPOSE 3000

# ENV PORT=3000
# ENV NEXT_PUBLIC_BACKEND_URL=http://localhost
# ENV NEXT_PUBLIC_FEED_URL=http://localhost

# # CMD ["npm", "start"]
# CMD ["tail", "-f", "/dev/null"]
