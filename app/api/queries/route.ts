import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// Create a new query
export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Students can create queries
    if (user.role !== "STUDENT") {
      return NextResponse.json({ error: "Only students can create queries" }, { status: 403 });
    }
    
    // Parse request body
    const { title, message, courseId } = await req.json();
    
    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
    }
    
    // Insert the query into the database
    const query = await prisma.query.create({
      data: {
        title,
        message,
        status: "OPEN",
        userId: user.id,
        courseId: courseId || null,
      },
    });
    
    return NextResponse.json({ query }, { status: 201 });
  } catch (error) {
    console.error("Error creating query:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Get all queries for current user (or all queries for admins)
export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Determine which queries to fetch based on user role
    const where = user.role === "ADMIN" ? {} : { userId: user.id };
    
    const queries = await prisma.query.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        responses: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    return NextResponse.json({ queries });
  } catch (error) {
    console.error("Error fetching queries:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

