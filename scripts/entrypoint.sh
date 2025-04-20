#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Creating admin user..."
ts-node --compiler-options '{"module":"CommonJS"}' scripts/create-admin.ts

echo "Starting Next.js application..."
exec npm run start

