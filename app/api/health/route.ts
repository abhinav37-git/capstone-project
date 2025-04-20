import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

export async function GET() {
  try {
    // Perform a simple database query to check connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    // If successful, return 200 OK
    return NextResponse.json(
      { status: 'ok', message: 'Health check passed' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    
    // If database check fails, return 500 Internal Server Error
    return NextResponse.json(
      { status: 'error', message: 'Health check failed' },
      { status: 500 }
    );
  } finally {
    // Disconnect Prisma client to avoid connection pool exhaustion
    await prisma.$disconnect();
  }
}
