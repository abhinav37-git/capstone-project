import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const queries = await prisma.query.findMany({
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const formattedQueries = queries.map(query => ({
      id: query.id,
      studentName: query.user.name,
      title: query.title,
      description: query.description,
      timestamp: query.createdAt.toLocaleString(),
      status: query.status,
    }))

    return NextResponse.json(formattedQueries)
  } catch (error) {
    console.error("[QUERIES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 