import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { Role } from "@prisma/client"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Public paths that don't require authentication
    if (path === "/" || path === "/login" || path === "/register") {
      return NextResponse.next()
    }

    // Ensure user is authenticated
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Role-based route protection
    if (path.startsWith("/admin") && token.role !== Role.ADMIN) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    if (path.startsWith("/teacher") && token.role !== Role.TEACHER) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    if (path === "/dashboard") {
      // Allow all authenticated users to access dashboard
      return NextResponse.next()
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

// Specify which routes should be protected
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/teacher/:path*",
    "/api/:path*"
  ]
} 