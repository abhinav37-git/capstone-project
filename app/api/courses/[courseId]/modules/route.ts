import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Schema for validating the module data in POST requests
const moduleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  content: z.string().optional(),
  resources: z.array(
    z.object({
      name: z.string().min(1),
      url: z.string().url("Invalid URL"),
      type: z.string().optional(),
    })
  ).optional(),
  order: z.number().optional(),
});

// GET handler to list all modules for a specific course
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const courseId = params.courseId;

    // Verify the course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Get all modules for the course, ordered by their position
    const modules = await prisma.module.findMany({
      where: {
        courseId: courseId,
      },
      orderBy: {
        order: "asc",
      },
      include: {
        resources: true,
      },
    });

    return NextResponse.json(modules);
  } catch (error) {
    console.error("Error fetching modules:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST handler to create a new module for a specific course
export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const courseId = params.courseId;
    const json = await request.json();

    // Validate the module data
    const validationResult = moduleSchema.safeParse(json);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid module data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const moduleData = validationResult.data;

    // Verify the course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Get the current highest order in the course modules (if any)
    const highestOrderModule = await prisma.module.findFirst({
      where: { courseId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    // Set the order to be one more than the highest current order, or 1 if there are no modules
    const order = moduleData.order ?? ((highestOrderModule?.order || 0) + 1);

    // Create the module with resources in a transaction
    const newModule = await prisma.$transaction(async (tx) => {
      // Create the module
      const newModuleData = await tx.module.create({
        data: {
          name: moduleData.name,
          description: moduleData.description || "",
          content: moduleData.content || "",
          order,
          course: {
            connect: { id: courseId },
          },
        },
      });

      // Create any associated resources
      if (moduleData.resources && moduleData.resources.length > 0) {
        await tx.resource.createMany({
          data: moduleData.resources.map(resource => ({
            name: resource.name,
            url: resource.url,
            type: resource.type || "link",
            moduleId: newModuleData.id,
          })),
        });
      }

      // Return the module with its resources
      return tx.module.findUnique({
        where: { id: newModuleData.id },
        include: { resources: true },
      });
    });

    return NextResponse.json(newModule, { status: 201 });
  } catch (error) {
    console.error("Error creating module:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

