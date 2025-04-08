import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function GET(
  req: Request,
  { params }: { params: { teacherId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const teacher = await prisma.user.findFirst({
      where: {
        id: params.teacherId,
        role: "TEACHER",
      } as Prisma.UserWhereInput,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        courses: {
          select: {
            id: true,
            title: true,
            description: true,
            createdAt: true,
            enrollments: {
              select: {
                id: true,
              },
            },
          },
        },
      } as Prisma.UserSelect,
    })

    if (!teacher) {
      return new NextResponse("Teacher not found", { status: 404 })
    }

    return NextResponse.json(teacher)
  } catch (error) {
    console.error("[TEACHER_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { teacherId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { name, email } = body

    if (!name || !email) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: {
          id: params.teacherId,
        },
      } as Prisma.UserWhereInput,
    })

    if (existingUser) {
      return new NextResponse("Email already exists", { status: 400 })
    }

    const teacher = await prisma.user.update({
      where: {
        id: params.teacherId,
      },
      data: {
        name,
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        courses: {
          select: {
            id: true,
          },
        },
      } as Prisma.UserSelect,
    })

    return NextResponse.json(teacher)
  } catch (error) {
    console.error("[TEACHER_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { teacherId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if teacher has any courses
    const courseCount = await prisma.course.count({
      where: {
        teacher: {
          id: params.teacherId,
        },
      } as Prisma.CourseWhereInput,
    })

    if (courseCount > 0) {
      return new NextResponse("Cannot delete teacher with existing courses", { status: 400 })
    }

    await prisma.user.delete({
      where: {
        id: params.teacherId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[TEACHER_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 