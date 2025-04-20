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
    if (path.startsWith("/admin") && token?.role !== Role.ADMIN) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (path.startsWith("/teacher") && token?.role !== Role.TEACHER) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Allow all authenticated users to access dashboard
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
);

// Specify which routes should be protected
// Note: We've simplified this to only protect specific routes and properly exclude auth and public routes
export const config = {
  matcher: [
    // Protected routes that require authentication
    "/dashboard/:path*",
    "/admin/:path*",
    "/teacher/:path*",
    
    // Protected API routes - explicitly exclude auth and health endpoints
    "/api/:path*((?!auth|health).*)",
  ]
};
