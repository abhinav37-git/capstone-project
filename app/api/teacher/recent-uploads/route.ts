import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "TEACHER") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get recent uploads from the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const uploads = await prisma.content.findMany({
      where: {
        module: {
          course: {
            teacherId: session.user.id
          }
        },
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Limit to 10 most recent uploads
    })

    return NextResponse.json({ uploads })
  } catch (error) {
    console.error("[RECENT_UPLOADS]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 