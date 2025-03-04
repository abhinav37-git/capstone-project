import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        modules: {
          include: {
            resources: true
          }
        },
        students: true
      }
    });
    
    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { name, description } = body;
    if (!name) {
      return NextResponse.json(
        { error: "Course name is required" },
        { status: 400 }
      );
    }
    
    // Create course in database
    const course = await prisma.course.create({
      data: {
        name,
        description: description || "",
        // If additional fields like modules are provided, they can be created here too
        modules: body.modules ? {
          create: body.modules.map((module: any, index: number) => ({
            name: module.name || module.title,
            description: module.description || "",
            content: module.content || "",
            order: module.order || index,
            resources: module.resources ? {
              create: module.resources.map((resource: any) => ({
                name: resource.name || resource.title,
                url: resource.url,
                type: resource.type || "link"
              }))
            } : undefined
          }))
        } : undefined
      },
      include: {
        modules: {
          include: {
            resources: true
          }
        },
        students: true
      }
    });
    
    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}

