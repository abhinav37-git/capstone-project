import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Schema for validating resource creation request
const createResourceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  type: z.string(),
  url: z.string().url("Invalid URL format"),
});

// GET /api/courses/[courseId]/modules/[moduleId]/resources
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string; moduleId: string } }
) {
  try {
    const { courseId, moduleId } = params;

    // Verify that the module exists and belongs to the specified course
    const module = await prisma.module.findUnique({
      where: {
        id: moduleId,
        courseId: courseId,
      },
    });

    if (!module) {
      return NextResponse.json(
        { error: "Module not found or doesn't belong to the specified course" },
        { status: 404 }
      );
    }

    // Fetch all resources for the module
    const resources = await prisma.resource.findMany({
      where: {
        moduleId: moduleId,
      },
    });

    return NextResponse.json(resources);
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}

// POST /api/courses/[courseId]/modules/[moduleId]/resources
export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string; moduleId: string } }
) {
  try {
    const { courseId, moduleId } = params;
    const body = await request.json();

    // Validate request body
    const validationResult = createResourceSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.format() },
        { status: 400 }
      );
    }

    // Verify that the module exists and belongs to the specified course
    const module = await prisma.module.findUnique({
      where: {
        id: moduleId,
        courseId: courseId,
      },
    });

    if (!module) {
      return NextResponse.json(
        { error: "Module not found or doesn't belong to the specified course" },
        { status: 404 }
      );
    }

    // Create the resource
    const resource = await prisma.resource.create({
      data: {
        name: body.name,
        description: body.description || "",
        type: body.type,
        url: body.url,
        moduleId: moduleId,
      },
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error("Error creating resource:", error);
    return NextResponse.json(
      { error: "Failed to create resource" },
      { status: 500 }
    );
  }
}

