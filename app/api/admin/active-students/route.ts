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

    // Check if the user is an admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get students who have been active in the last 15 minutes
    const fifteenMinutesAgo = new Date()
    fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15)

    const activeStudents = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        progress: {
          some: {
            updatedAt: {
              gte: fifteenMinutesAgo
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        progress: {
          orderBy: {
            updatedAt: 'desc'
          },
          take: 1,
          include: {
            module: true
          }
        }
      }
    })

    // Format the response
    const formattedStudents = activeStudents.map(student => {
      const latestProgress = student.progress[0]
      const timeDiff = Math.floor(
        (new Date().getTime() - latestProgress.updatedAt.getTime()) / 60000
      )

      return {
        id: student.id,
        name: student.name,
        currentModule: latestProgress.module.title,
        lastActive: `${timeDiff} minutes ago`,
        progress: Math.round((latestProgress.status === "COMPLETED" ? 100 : 0))
      }
    })

    return NextResponse.json(formattedStudents)
  } catch (error) {
    console.error("Error fetching active students:", error)
    return NextResponse.json(
      { error: "Failed to fetch active students" },
      { status: 500 }
    )
  }
} 