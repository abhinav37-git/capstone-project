import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Role } from "@prisma/client"

export async function GET() {
  try {
    console.log("[ADMIN_CHECK] Starting admin status check")
    const session = await getServerSession(authOptions)
    
    console.log("[ADMIN_CHECK] Session:", JSON.stringify({ 
      exists: !!session,
      user: session?.user ? {
        role: session.user.role,
        email: session.user.email
      } : null 
    }))
    
    if (!session) {
      console.log("[ADMIN_CHECK] No session found")
      return NextResponse.json({ 
        error: "Unauthorized",
        message: "No active session found"
      }, { 
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }
    
    // If user is authenticated and is an admin, allow admin creation
    if (session.user?.role === Role.ADMIN) {
      console.log("[ADMIN_CHECK] User is admin")
      return NextResponse.json({ 
        hasAdmin: true, 
        canCreateAdmin: true 
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

    // Check if any admin exists
    const adminCount = await prisma.user.count({
      where: {
        role: Role.ADMIN
      }
    })

    console.log("[ADMIN_CHECK] Admin count:", adminCount)

    return NextResponse.json({ 
      hasAdmin: adminCount > 0,
      canCreateAdmin: adminCount === 0
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error("[ADMIN_CHECK] Error:", error)
    
    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes("prisma")) {
        console.error("[ADMIN_CHECK] Database error:", error.message)
        return NextResponse.json({ 
          error: "Database Error",
          message: "Failed to check admin status in database"
        }, { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        })
      }
      
      return NextResponse.json({ 
        error: "Server Error",
        message: error.message
      }, { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }
    
    return NextResponse.json({ 
      error: "Unknown Error",
      message: "An unexpected error occurred"
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
} 