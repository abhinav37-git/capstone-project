# Stage 1: Install dependencies and build the Next.js application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY bun.lock ./

# Install dependencies
RUN npm install

# Copy prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Stage 2: Python setup for AI model server
FROM python:3.9-slim AS python-deps
WORKDIR /app

# Copy Python requirements and scripts
COPY requirements.txt .
COPY ai_model_server.py .
COPY download_model.py .
COPY gpt2-model ./gpt2-model/

# Install Python dependencies
RUN pip install -r requirements.txt
RUN python download_model.py

# Stage 3: Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Install Python in the final image
RUN apk add --no-cache python3 py3-pip

# Copy built Next.js application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Copy Python components
COPY --from=python-deps /app/ai_model_server.py .
COPY --from=python-deps /app/gpt2-model ./gpt2-model
COPY --from=python-deps /usr/local/lib/python3.9 /usr/local/lib/python3.9
COPY --from=python-deps /usr/local/bin/python /usr/local/bin/python

# Install production dependencies
RUN npm install --production

ENV NODE_ENV production
EXPOSE 3000

# Start both Next.js and Python server
CMD ["sh", "-c", "python ai_model_server.py & npm start"]
