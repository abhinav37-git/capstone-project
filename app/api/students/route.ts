import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role } from "@prisma/client"

type Student = {
  id: string
  name: string | null
  email: string
  role: Role
  studentId: string | null
  isApproved: boolean
  enrollments: Array<{
    course: {
      id: string
      title: string
    }
  }>
  progress: Array<{
    status: string
    module: {
      id: string
    }
  }>
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Only teachers can access student information" },
        { status: 403 }
      )
    }

    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
      },
      include: {
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        progress: {
          include: {
            module: true,
          },
        },
      },
    }) as unknown as Student[]

    // Calculate progress and format the response
    const formattedStudents = students.map((student) => {
      // Calculate overall progress
      const totalModules = student.progress.length
      const completedModules = student.progress.filter(p => p.status === "COMPLETED").length
      const progressPercentage = totalModules > 0 
        ? Math.round((completedModules / totalModules) * 100)
        : 0

      return {
        id: student.id,
        name: student.name || "",
        email: student.email,
        studentId: student.studentId || "",
        isApproved: student.isApproved,
        enrolledCourses: student.enrollments.map(enrollment => ({
          id: enrollment.course.id,
          title: enrollment.course.title,
        })),
        progress: progressPercentage,
      }
    })

    return NextResponse.json({ students: formattedStudents })
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    )
  }
} 