import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const adminCount = await prisma.user.count({
      where: {
        role: "ADMIN"
      }
    })

    return NextResponse.json({ hasAdmin: adminCount > 0 })
  } catch (error) {
    console.error("[ADMIN_CHECK]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 