import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    // Verify that the request is from a teacher
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Only teachers can pre-register students" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { studentId, email } = body

    if (!studentId || !email) {
      return NextResponse.json(
        { error: "Student ID and email are required" },
        { status: 400 }
      )
    }

    // Check if email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 409 }
      )
    }

    // Create or update the pre-registration record
    const preRegistration = await prisma.preRegistration.upsert({
      where: { 
        studentId_email: {
          studentId,
          email
        }
      },
      update: {
        updatedAt: new Date()
      },
      create: {
        studentId,
        email,
        registeredBy: session.user.id
      }
    })

    return NextResponse.json(preRegistration, { status: 201 })
  } catch (error) {
    console.error("Error in pre-registration:", error)
    return NextResponse.json(
      { error: "Failed to pre-register student" },
      { status: 500 }
    )
  }
} 