import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        description: true,
      },
      orderBy: {
        title: 'asc',
      },
    })
    
    return NextResponse.json(courses)
  } catch (error) {
    console.error("Error fetching available courses:", error)
    return NextResponse.json(
      { error: "Failed to fetch available courses" },
      { status: 500 }
    )
  }
} 