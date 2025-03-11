import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Schema for validating course update data
const courseUpdateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.number().optional(),
  isPublished: z.boolean().optional(),
  // Relationships can be handled separately through dedicated endpoints
});

// GET a course by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const courseId = params.courseId;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            resources: true,
          },
        },
        students: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}

// PATCH to update a course
export async function PATCH(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const courseId = params.courseId;
    const body = await req.json();

    // Validate the request body
    const validatedData = courseUpdateSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validatedData.error.format() },
        { status: 400 }
      );
    }

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Update the course
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: validatedData.data,
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    );
  }
}

// DELETE a course
export async function DELETE(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const courseId = params.courseId;

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Delete the course
    // Note: This will only work if cascading deletes are set up in the Prisma schema
    // or if there are no related records (modules, students, etc.)
    await prisma.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json(
      { message: "Course deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting course:", error);
    
    // Check if error is related to foreign key constraints
    if (error instanceof Error && error.message.includes("foreign key constraint")) {
      return NextResponse.json(
        { error: "Cannot delete course with related records. Delete related records first." },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}

