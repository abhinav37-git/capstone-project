import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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
      include: {
        progress: {
          orderBy: {
            updatedAt: 'desc'
          },
          take: 1,
          include: {
            module: {
              include: {
                course: true
              }
            }
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
        currentModule: latestProgress.module.name,
        lastActive: `${timeDiff} minutes ago`
      }
    })

    return NextResponse.json({ students: formattedStudents })
  } catch (error) {
    console.error("Error fetching active students:", error)
    return NextResponse.json(
      { error: "Failed to fetch active students" },
      { status: 500 }
    )
  }
} 