import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch all students with their enrollments and progress
    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
      },
      include: {
        enrollments: {
          include: {
            course: true,
          },
        },
        progress: true,
      },
    })

    // Transform the data to match the expected format
    const formattedStudents = students.map((student) => {
      const enrolledCourses = student.enrollments.map((enrollment) => enrollment.course.name)
      const totalProgress = student.progress.reduce((acc, curr) => acc + curr.progress, 0)
      const averageProgress = student.progress.length > 0 
        ? Math.round(totalProgress / student.progress.length) 
        : 0

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        enrolledCourses,
        progress: averageProgress,
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