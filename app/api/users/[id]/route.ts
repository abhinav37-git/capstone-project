import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Module, Progress } from "@prisma/client";

interface ModuleWithContent extends Module {
  content: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    fileUrl: string;
  }>;
}

// GET /api/users/[id] - Get a specific user by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure params.id exists
    if (!params.id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
      include: {
        enrollments: {
          include: {
            course: {
              include: {
                modules: {
                  include: {
                    content: true,
                  },
                },
              },
            },
          },
        },
        progress: true,
        queries: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Transform the data to match the expected structure
    const transformedUser = {
      ...user,
      studentCourses: user.enrollments.map(enrollment => ({
        course: {
          ...enrollment.course,
          progress: calculateCourseProgress(
            enrollment.course.modules as ModuleWithContent[],
            user.progress
          ),
        },
      })),
    };

    return NextResponse.json(transformedUser);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// Helper function to calculate course progress
function calculateCourseProgress(
  modules: ModuleWithContent[],
  progress: Progress[]
): number {
  if (!modules.length) return 0;
  
  const completedModules = modules.filter(module => {
    const moduleProgress = progress.find(p => p.moduleId === module.id);
    return moduleProgress?.status === "COMPLETED";
  });

  return Math.round((completedModules.length / modules.length) * 100);
}

// PATCH /api/users/[id] - Update a specific user
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();
    
    // Make sure user exists before attempting update
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Remove fields that shouldn't be updated directly
    const { id: userId, createdAt, updatedAt, ...updateData } = body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete a specific user
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Make sure user exists before attempting deletion
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Delete the user
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}

