import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withAuth } from "next-auth/middleware";
import { Role } from "@prisma/client";

// Use withAuth middleware for protected routes
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Role-based access control
    if (path.startsWith("/admin") && token.role !== Role.ADMIN) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (path.startsWith("/teacher") && token.role !== Role.TEACHER) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (path === "/dashboard") {
      // Allow all authenticated users to access dashboard
      return NextResponse.next();
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
);

// Specify which routes should be protected and which should be excluded
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/teacher/:path*",
    
    // Protect API routes except health check
    "/api/:path*", 
    
    // Exclude these paths
    "/((?!api/health|_next/static|_next/image|favicon.ico).*)",
  ]
};
