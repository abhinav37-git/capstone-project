# Stage 1: Install dependencies and build the Next.js application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files, Prisma schema, and scripts first
COPY package*.json ./
COPY bun.lock ./
COPY prisma ./prisma/
COPY scripts ./scripts/
COPY tsconfig.json ./

# Install dependencies (will run prisma generate via postinstall)
RUN npm install

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Setup for migrations and admin creation
RUN npm install -g prisma
RUN npm install -g typescript ts-node @types/node

# Stage 2: Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Copy built Next.js application and necessary files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Setup entry point script
COPY scripts/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Install production dependencies and ts-node for admin creation
RUN npm install --production
RUN npm install -g typescript ts-node @types/node

ENV NODE_ENV production
EXPOSE 3000

# Use entrypoint script
ENTRYPOINT ["./entrypoint.sh"]
