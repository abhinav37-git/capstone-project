#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Creating admin user..."
npm run create-admin

echo "Starting Next.js application..."
exec npm run start

