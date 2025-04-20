import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !["TEACHER", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Only teachers and admins can manage enrollments" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { studentId, courseIds } = body

    if (!studentId || !Array.isArray(courseIds)) {
      return NextResponse.json(
        { error: "Student ID and course IDs are required" },
        { status: 400 }
      )
    }

    // Get current enrollments
    const currentEnrollments = await prisma.enrollment.findMany({
      where: { studentId },
      select: { courseId: true }
    })
    const currentCourseIds = currentEnrollments.map(e => e.courseId)

    // Calculate courses to add and remove
    const coursesToAdd = courseIds.filter(id => !currentCourseIds.includes(id))
    const coursesToRemove = currentCourseIds.filter(id => !courseIds.includes(id))

    // Perform the updates in a transaction
    await prisma.$transaction(async (tx) => {
      // Remove enrollments
      if (coursesToRemove.length > 0) {
        await tx.enrollment.deleteMany({
          where: {
            studentId,
            courseId: { in: coursesToRemove }
          }
        })
      }

      // Add new enrollments
      if (coursesToAdd.length > 0) {
        await tx.enrollment.createMany({
          data: coursesToAdd.map(courseId => ({
            studentId,
            courseId,
          }))
        })
      }
    })

    // Get updated enrollments
    const updatedEnrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      enrollments: updatedEnrollments
    })
  } catch (error) {
    console.error("Error updating enrollments:", error)
    return NextResponse.json(
      { error: "Failed to update enrollments" },
      { status: 500 }
    )
  }
} 