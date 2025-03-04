import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: Retrieve a specific module by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string; moduleId: string } }
) {
  try {
    const { courseId, moduleId } = params;

    const module = await prisma.module.findUnique({
      where: {
        id: moduleId,
        courseId: courseId,
      },
      include: {
        resources: true,
      },
    });

    if (!module) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(module);
  } catch (error) {
    console.error("Error fetching module:", error);
    return NextResponse.json(
      { error: "Failed to fetch module" },
      { status: 500 }
    );
  }
}

// PATCH: Update a specific module
export async function PATCH(
  request: NextRequest,
  { params }: { params: { courseId: string; moduleId: string } }
) {
  try {
    const { courseId, moduleId } = params;
    const body = await request.json();

    // Verify that the module exists and belongs to the specified course
    const existingModule = await prisma.module.findUnique({
      where: {
        id: moduleId,
        courseId: courseId,
      },
    });

    if (!existingModule) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      );
    }

    // Update the module
    const updatedModule = await prisma.module.update({
      where: {
        id: moduleId,
      },
      data: {
        name: body.name,
        description: body.description,
        content: body.content,
        // Optionally update other fields
      },
      include: {
        resources: true,
      },
    });

    return NextResponse.json(updatedModule);
  } catch (error) {
    console.error("Error updating module:", error);
    return NextResponse.json(
      { error: "Failed to update module" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a specific module
export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseId: string; moduleId: string } }
) {
  try {
    const { courseId, moduleId } = params;

    // Verify that the module exists and belongs to the specified course
    const existingModule = await prisma.module.findUnique({
      where: {
        id: moduleId,
        courseId: courseId,
      },
    });

    if (!existingModule) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      );
    }

    // Delete associated resources first (if cascade delete is not configured in Prisma)
    await prisma.resource.deleteMany({
      where: {
        moduleId: moduleId,
      },
    });

    // Delete the module
    await prisma.module.delete({
      where: {
        id: moduleId,
      },
    });

    return NextResponse.json(
      { message: "Module deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting module:", error);
    return NextResponse.json(
      { error: "Failed to delete module" },
      { status: 500 }
    );
  }
}

