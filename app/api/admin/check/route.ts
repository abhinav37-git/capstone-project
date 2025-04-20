import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    // If user is authenticated and is an admin, allow admin creation
    if (session?.user?.role === "ADMIN") {
      return NextResponse.json({ hasAdmin: true, canCreateAdmin: true })
    }

    // Check if any admin exists
    const adminCount = await prisma.user.count({
      where: {
        role: "ADMIN"
      }
    })

    return NextResponse.json({ 
      hasAdmin: adminCount > 0,
      canCreateAdmin: adminCount === 0
    })
  } catch (error) {
    console.error("[ADMIN_CHECK]", error)
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 