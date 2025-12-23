import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Middleware for protecting admin routes
 * Checks for admin_token cookie before allowing access
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for login page and API routes
  if (pathname === "/admin/login" || pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // Check for admin authentication cookie
  const hasAuthCookie = request.cookies.has("admin_token")

  if (!hasAuthCookie) {
    // Redirect to admin login page
    const loginUrl = new URL("/admin/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
