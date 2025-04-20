# Stage 1: Install dependencies and build the Next.js application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and Prisma schema first
COPY package*.json ./
COPY bun.lock ./
COPY prisma ./prisma/

# Install dependencies (will run prisma generate via postinstall)
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Copy built Next.js application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Install production dependencies
RUN npm install --production

ENV NODE_ENV production
EXPOSE 3000

# Start Next.js server
CMD ["npm", "start"]
