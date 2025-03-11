import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// Get a single query by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
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
    
    const query = await prisma.query.findUnique({
      where: { id: params.id },
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
    });
    
    if (!query) {
      return NextResponse.json({ error: "Query not found" }, { status: 404 });
    }
    
    // Verify the user has permission to view this query
    if (user.role !== "ADMIN" && query.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    return NextResponse.json({ query });
  } catch (error) {
    console.error("Error fetching query:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Update a query (e.g., change status)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
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
    
    const query = await prisma.query.findUnique({
      where: { id: params.id },
    });
    
    if (!query) {
      return NextResponse.json({ error: "Query not found" }, { status: 404 });
    }
    
    const { status, message } = await req.json();
    
    // Only admins can change query status
    if (status && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only administrators can change query status" }, { status: 403 });
    }
    
    // Only the query owner can edit the message
    if (message && query.userId !== user.id) {
      return NextResponse.json({ error: "You can only edit your own queries" }, { status: 403 });
    }
    
    const updatedQuery = await prisma.query.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(message && { message }),
      },
    });
    
    return NextResponse.json({ query: updatedQuery });
  } catch (error) {
    console.error("Error updating query:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

