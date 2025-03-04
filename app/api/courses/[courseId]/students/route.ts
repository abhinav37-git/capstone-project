import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - retrieve all students enrolled in a course
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const courseId = params.courseId;

    // Find the course with all enrolled students
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        students: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(course.students);
  } catch (error) {
    console.error("Error fetching enrolled students:", error);
    return NextResponse.json(
      { error: "Failed to fetch enrolled students" },
      { status: 500 }
    );
  }
}

// POST - enroll a student in a course
export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const courseId = params.courseId;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if the student is already enrolled
    const enrollment = await prisma.course.findFirst({
      where: {
        id: courseId,
        students: {
          some: {
            id: userId,
          },
        },
      },
    });

    if (enrollment) {
      return NextResponse.json(
        { error: "Student is already enrolled in this course" },
        { status: 409 }
      );
    }

    // Enroll the student in the course
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        students: {
          connect: { id: userId },
        },
      },
      include: {
        students: true,
      },
    });

    return NextResponse.json(updatedCourse, { status: 201 });
  } catch (error) {
    console.error("Error enrolling student:", error);
    return NextResponse.json(
      { error: "Failed to enroll student" },
      { status: 500 }
    );
  }
}

// DELETE - unenroll a student from a course
export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const courseId = params.courseId;
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if the student is enrolled
    const enrollment = await prisma.course.findFirst({
      where: {
        id: courseId,
        students: {
          some: {
            id: userId,
          },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Student is not enrolled in this course" },
        { status: 404 }
      );
    }

    // Unenroll the student from the course
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        students: {
          disconnect: { id: userId },
        },
      },
      include: {
        students: true,
      },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("Error unenrolling student:", error);
    return NextResponse.json(
      { error: "Failed to unenroll student" },
      { status: 500 }
    );
  }
}

