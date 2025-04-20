#!/bin/bash

# Start PostgreSQL container
echo "Starting PostgreSQL container..."
docker compose up -d

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 5

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Seed the database (if needed)
echo "Seeding the database..."
npx prisma db seed

echo "Database setup complete!" 