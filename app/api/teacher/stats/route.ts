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

    const [
      totalStudents,
      activeCourses,
      totalContent,
      recentUploads
    ] = await Promise.all([
      prisma.user.count({
        where: { role: "STUDENT" }
      }),
      prisma.course.count({
        where: { teacherId: session.user.id }
      }),
      prisma.content.count({
        where: {
          module: {
            course: {
              teacherId: session.user.id
            }
          }
        }
      }),
      prisma.content.count({
        where: {
          module: {
            course: {
              teacherId: session.user.id
            }
          },
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ])

    return NextResponse.json({
      totalStudents,
      activeCourses,
      totalContent,
      recentUploads
    })
  } catch (error) {
    console.error("[TEACHER_STATS]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 