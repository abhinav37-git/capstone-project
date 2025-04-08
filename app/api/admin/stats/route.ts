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

    // Get total students
    const totalStudents = await prisma.user.count({
      where: {
        role: "STUDENT"
      }
    })

    // Get active courses
    const activeCourses = await prisma.course.count()

    // Get pending queries
    const pendingQueries = await prisma.query.count({
      where: {
        status: "OPEN"
      }
    })

    return NextResponse.json({
      totalStudents,
      activeCourses,
      pendingQueries
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    )
  }
} 