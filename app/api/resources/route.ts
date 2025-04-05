import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authOptions } from "../auth/[...nextauth]/route";

// Resource type definition
export type ResourceType = "LINK" | "FILE" | "DOCUMENT" | "VIDEO" | "IMAGE";

// TypeScript interfaces for resource data
interface ResourceBase {
  title: string;
  description?: string;
  type: ResourceType;
  moduleId?: string;
  courseId?: string;
}

interface LinkResource extends ResourceBase {
  type: "LINK";
  url: string;
}

interface FileResource extends ResourceBase {
  type: "FILE" | "DOCUMENT" | "VIDEO" | "IMAGE";
  fileUrl: string;
  fileSize?: number;
  fileType?: string;
}

type ResourceData = LinkResource | FileResource;

// Zod schemas for validation
const urlSchema = z.string().url("Invalid URL format");

const baseResourceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(["LINK", "FILE", "DOCUMENT", "VIDEO", "IMAGE"]),
  moduleId: z.string().uuid("Invalid module ID").optional(),
  courseId: z.string().uuid("Invalid course ID").optional(),
});

const linkResourceSchema = baseResourceSchema.extend({
  type: z.literal("LINK"),
  url: urlSchema,
});

const fileResourceSchema = baseResourceSchema.extend({
  type: z.enum(["FILE", "DOCUMENT", "VIDEO", "IMAGE"]),
  fileUrl: urlSchema,
  fileSize: z.number().positive().optional(),
  fileType: z.string().optional(),
});

const resourceSchema = z.discriminatedUnion("type", [
  linkResourceSchema,
  fileResourceSchema,
]);

// GET handler to fetch resources with filtering
export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse query parameters
    const url = new URL(req.url);
    const type = url.searchParams.get("type") as ResourceType | null;
    const moduleId = url.searchParams.get("moduleId");
    const courseId = url.searchParams.get("courseId");
    const search = url.searchParams.get("search");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const page = parseInt(url.searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    // Build the query filter
    const where: any = {};
    
    if (type) {
      where.type = type;
    }
    
    if (moduleId) {
      where.moduleId = moduleId;
    }
    
    if (courseId) {
      where.courseId = courseId;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count for pagination
    const totalCount = await prisma.resource.count({ where });

    // Fetch resources
    const resources = await prisma.resource.findMany({
      where,
      include: {
        module: {
          select: {
            id: true,
            title: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Return resources with pagination info
    return NextResponse.json({
      resources,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json(
      { error: `Failed to fetch resources: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}

// POST handler to create a new resource
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await req.json();

    // Validate the request body
    const validationResult = resourceSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid resource data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const resourceData = validationResult.data;

    // Verify module exists if specified
    if (resourceData.moduleId) {
      const module = await prisma.module.findUnique({
        where: { id: resourceData.moduleId },
      });

      if (!module) {
        return NextResponse.json(
          { error: "Module not found" },
          { status: 404 }
        );
      }
    }

    // Verify course exists if specified
    if (resourceData.courseId) {
      const course = await prisma.course.findUnique({
        where: { id: resourceData.courseId },
      });

      if (!course) {
        return NextResponse.json(
          { error: "Course not found" },
          { status: 404 }
        );
      }
    }

    // Prepare data for creation based on resource type
    const createData: any = {
      title: resourceData.title,
      description: resourceData.description,
      type: resourceData.type,
      moduleId: resourceData.moduleId || null,
      courseId: resourceData.courseId || null,
      createdById: userId,
    };

    // Add specific fields based on resource type
    if (resourceData.type === "LINK") {
      createData.url = resourceData.url;
    } else {
      createData.fileUrl = resourceData.fileUrl;
      createData.fileSize = resourceData.fileSize;
      createData.fileType = resourceData.fileType;
    }

    // Create the resource
    const resource = await prisma.resource.create({
      data: createData,
      include: {
        module: {
          select: {
            id: true,
            title: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error("Error creating resource:", error);
    return NextResponse.json(
      { error: `Failed to create resource: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
