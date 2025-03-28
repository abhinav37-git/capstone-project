import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// Add a response to a query
export async function POST(
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
    
    // Check if user is authorized to respond
    // Admins can respond to any query
    // Students can only respond to their own queries
    if (user.role !== "ADMIN" && query.userId !== user.id) {
      return NextResponse.json({ error: "You are not authorized to respond to this query" }, { status: 403 });
    }
    
    const { message, updateStatus } = await req.json();
    
    if (!message || message.trim() === "") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }
    
    // Create the response
    const response = await prisma.queryResponse.create({
      data: {
        message,
        queryId: query.id,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });
    
    // If an admin responds to a query, update its status based on the updateStatus parameter
    // or automatically change it to IN_PROGRESS if it's currently OPEN
    if (user.role === "ADMIN") {
      let newStatus = query.status;
      
      if (updateStatus) {
        newStatus = updateStatus;
      } else if (query.status === "OPEN") {
        newStatus = "IN_PROGRESS";
      }
      
      if (newStatus !== query.status) {
        await prisma.query.update({
          where: { id: query.id },
          data: { status: newStatus },
        });
      }
    }
    
    return NextResponse.json({ response }, { status: 201 });
  } catch (error) {
    console.error("Error creating response:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Update the status of a query
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
    
    // Only admins can update query status
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only administrators can update query status" }, { status: 403 });
    }
    
    const query = await prisma.query.findUnique({
      where: { id: params.id },
    });
    
    if (!query) {
      return NextResponse.json({ error: "Query not found" }, { status: 404 });
    }
    
    const { status } = await req.json();
    
    if (!status || !["OPEN", "IN_PROGRESS", "RESOLVED"].includes(status)) {
      return NextResponse.json({ error: "Valid status is required" }, { status: 400 });
    }
    
    const updatedQuery = await prisma.query.update({
      where: { id: query.id },
      data: { status },
    });
    
    return NextResponse.json({ query: updatedQuery });
  } catch (error) {
    console.error("Error updating query status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
