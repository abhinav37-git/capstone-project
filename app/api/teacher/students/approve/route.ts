import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

export async function POST(request: Request) {
  try {
    // Verify that the request is from a teacher
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Only teachers can approve students" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { studentId } = body

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      )
    }

    // Check if student exists and is not already approved
    const student = await prisma.user.findFirst({
      where: {
        id: studentId,
        role: Role.STUDENT,
      },
    })

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      )
    }

    if (student.isApproved) {
      return NextResponse.json(
        { error: "Student is already approved" },
        { status: 409 }
      )
    }

    // Approve the student
    const updatedStudent = await prisma.user.update({
      where: { id: studentId },
      data: { isApproved: true },
    })

    return NextResponse.json({
      success: true,
      student: {
        id: updatedStudent.id,
        name: updatedStudent.name,
        email: updatedStudent.email,
        isApproved: updatedStudent.isApproved,
      }
    })
  } catch (error) {
    console.error("Error approving student:", error)
    return NextResponse.json(
      { error: "Failed to approve student" },
      { status: 500 }
    )
  }
} 