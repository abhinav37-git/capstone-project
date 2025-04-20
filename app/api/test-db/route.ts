import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    await prisma.$connect()
    const userCount = await prisma.user.count()
    return NextResponse.json({ 
      connected: true,
      userCount,
      message: "Database connection successful"
    })
  } catch (error) {
    console.error("[DB_TEST]", error)
    return NextResponse.json({ 
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 