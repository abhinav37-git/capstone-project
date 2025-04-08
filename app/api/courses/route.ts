import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Define interfaces for type safety
interface ModuleResource {
  name?: string;
  title?: string;
  url: string;
  type?: string;
}

interface CourseModule {
  name?: string;
  title?: string;
  description?: string;
  content?: string;
  order?: number;
  resources?: ModuleResource[];
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courses = await prisma.course.findMany({
      include: {
        modules: true,
        enrollments: true,
      },
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
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Received course creation request:", body);
    
    // Validate required fields
    const { title, description } = body;
    if (!title) {
      return NextResponse.json(
        { error: "Course title is required" },
        { status: 400 }
      );
    }
    
    // Create course in database
    const course = await prisma.course.create({
      data: {
        title,
        description: description || "",
        teacherId: session.user.id,
      },
      include: {
        modules: true,
        enrollments: true,
      }
    });
    
    console.log("Course created successfully:", course);
    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: `Failed to create course: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

