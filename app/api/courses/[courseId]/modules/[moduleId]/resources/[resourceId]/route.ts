import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { courseId: string; moduleId: string; resourceId: string } }
) {
  try {
    const { courseId, moduleId, resourceId } = params;

    // Verify that the resource exists and belongs to the specified module
    const resource = await prisma.resource.findUnique({
      where: {
        id: resourceId,
        moduleId: moduleId,
        module: {
          courseId: courseId,
        },
      },
    });

    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(resource);
  } catch (error) {
    console.error("Error fetching resource:", error);
    return NextResponse.json(
      { error: "Failed to fetch resource" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { courseId: string; moduleId: string; resourceId: string } }
) {
  try {
    const { courseId, moduleId, resourceId } = params;
    const body = await request.json();

    // Verify the resource exists and belongs to the specified module
    const existingResource = await prisma.resource.findUnique({
      where: {
        id: resourceId,
        moduleId: moduleId,
        module: {
          courseId: courseId,
        },
      },
    });

    if (!existingResource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    // Update the resource
    const updatedResource = await prisma.resource.update({
      where: {
        id: resourceId,
      },
      data: {
        name: body.name,
        type: body.type,
        url: body.url,
        content: body.content,
        // Only update the fields provided in the request
      },
    });

    return NextResponse.json(updatedResource);
  } catch (error) {
    console.error("Error updating resource:", error);
    return NextResponse.json(
      { error: "Failed to update resource" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { courseId: string; moduleId: string; resourceId: string } }
) {
  try {
    const { courseId, moduleId, resourceId } = params;

    // Verify the resource exists and belongs to the specified module
    const existingResource = await prisma.resource.findUnique({
      where: {
        id: resourceId,
        moduleId: moduleId,
        module: {
          courseId: courseId,
        },
      },
    });

    if (!existingResource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    // Delete the resource
    await prisma.resource.delete({
      where: {
        id: resourceId,
      },
    });

    return NextResponse.json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error("Error deleting resource:", error);
    return NextResponse.json(
      { error: "Failed to delete resource" },
      { status: 500 }
    );
  }
}

