# Stage 1: Install dependencies and build the Next.js application
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY bun.lock ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Python setup for AI model server
FROM python:3.9-slim AS python-deps
WORKDIR /app
COPY requirements.txt .
COPY ai_model_server.py .
COPY download_model.py .
RUN pip install -r requirements.txt
RUN python download_model.py

# Stage 3: Production image
FROM node:18-alpine AS runner
WORKDIR /app

# Copy built Next.js application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

# Copy Python components
COPY --from=python-deps /app/ai_model_server.py .
COPY --from=python-deps /usr/local/lib/python3.9 /usr/local/lib/python3.9
COPY --from=python-deps /usr/local/bin/python /usr/local/bin/python

ENV NODE_ENV production
EXPOSE 3000

CMD ["npm", "start"]
